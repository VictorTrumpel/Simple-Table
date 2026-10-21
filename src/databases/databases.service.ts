import { ForbiddenException, Injectable } from '@nestjs/common';
import { IsNull, Repository, In, EntityManager } from 'typeorm';
import { Database } from './entities/database.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersDatabases } from './entities/usersDatabases.entity';
import { CreateDatabaseDto } from './dto/CreateDatabaseDto';
import { SetRoleDto } from './dto/SetRoleDto';
import { User } from 'src/users/entities/user.entity';
import { randomUUID } from 'node:crypto';
import { Table } from 'src/tables/entities/table.entity';
import { CreateTableDto } from './dto/CreateTableDto';
import { DynTableFactory } from 'src/tables/repository/dynTable.repository';
import { ChangelogService } from 'src/changelog/changelog.service';
import { ExcleReaderService } from 'src/tables/services/excelReader.service';
import { createColId } from 'src/tables/utils/createColId';
import { createTableId } from 'src/tables/utils/createTableId';
import { CreateChartDto } from './dto/CreateChartDto';
import { ChartEntity } from 'src/charts/entities/chart.entity';
import { ChartBindingsEntity } from 'src/charts/entities/chartBindings.entity';

@Injectable()
export class DatabasesService {
  constructor(
    private entityManager: EntityManager,
    @InjectRepository(Database)
    private readonly databasesRepository: Repository<Database>,
    @InjectRepository(UsersDatabases)
    private readonly usersDatabasesRepository: Repository<UsersDatabases>,
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
    @InjectRepository(ChartEntity)
    private readonly chartRepository: Repository<ChartEntity>,
    private dynTableFactory: DynTableFactory,
    private changelogService: ChangelogService,
    private excelReaderService: ExcleReaderService,
  ) {}

  async getDatabaseListOfUser(userId: number) {
    const userDatabases = await this.usersDatabasesRepository.find({
      where: { userId, deletedAt: IsNull() },
    });

    const databaseRoleMap = new Map(
      userDatabases.map(({ databaseId, role }) => [databaseId, role]),
    );
    const databasesIds = userDatabases.map(({ databaseId }) => databaseId);

    const databases = await this.databasesRepository.find({
      where: { id: In(databasesIds), deletedAt: IsNull() },
    });

    const tablesOfDatabases: Table[] = await this.tableRepository.find({
      where: { databaseId: In(databasesIds), deletedAt: IsNull() },
      select: { id: true, name: true, databaseId: true, createdAt: true },
    });

    const chartsOfDatabases: ChartEntity[] = await this.chartRepository.find({
      where: { databaseId: In(databasesIds) },
      select: { id: true, name: true, databaseId: true },
    });

    type TableWithoutColumns = Omit<Table, 'columns' | 'deletedAt'>;
    const tablesWithoutColumns: TableWithoutColumns[] = tablesOfDatabases.map(
      (t) => ({
        id: t.id,
        name: t.name,
        databaseId: t.databaseId,
        createdAt: t.createdAt,
      }),
    );

    const dbTablesMap = new Map<number, TableWithoutColumns[]>();
    tablesWithoutColumns.forEach((table) => {
      const dbId = table.databaseId;

      if (dbTablesMap.has(dbId)) {
        (dbTablesMap.get(dbId) ?? []).push(table);
        return;
      }

      dbTablesMap.set(dbId, [table]);
    });

    type ChartWithoutConfig = Omit<ChartEntity, 'config'>;
    const dbChartMap = new Map<number, ChartWithoutConfig[]>();

    chartsOfDatabases.forEach((chart) => {
      const dbId = chart.databaseId;

      const chartWithoutConfig: ChartWithoutConfig = {
        id: chart.id,
        name: chart.name,
        databaseId: chart.databaseId,
      };

      if (dbChartMap.has(dbId)) {
        (dbChartMap.get(dbId) ?? []).push(chartWithoutConfig);
        return;
      }

      dbChartMap.set(dbId, [chartWithoutConfig]);
    });

    const databasesWithTables = databases.map((db) => {
      return {
        id: db.id,
        role: databaseRoleMap.get(db.id),
        name: db.name,
        tables: dbTablesMap.get(db.id) ?? [],
        charts: dbChartMap.get(db.id) ?? [],
      };
    });

    return databasesWithTables;
  }

  async create(createDatabaseDto: CreateDatabaseDto, userId: number) {
    const newDatabase = this.databasesRepository.create({
      name: createDatabaseDto.name,
    });

    await this.databasesRepository.save(newDatabase);

    await this.usersDatabasesRepository.upsert(
      {
        userId,
        databaseId: newDatabase.id,
        role: 'admin',
      },
      ['userId', 'databaseId'],
    );

    return newDatabase;
  }

  async getUsersOfDatabase(dbId: number) {
    return this.usersDatabasesRepository
      .createQueryBuilder('participant')
      .leftJoinAndMapOne(
        'participant.user',
        User,
        'user',
        'user.id = participant.userId',
      )
      .where('participant.databaseId = :dbId', { dbId })
      .getMany();
  }

  async setRoleInDb(adminId: number, dbId: number, setRoleDto: SetRoleDto) {
    return this.entityManager.transaction(async (manager) => {
      const repository = manager.getRepository(UsersDatabases);

      await this.checkIfAdminOrThrow(manager, adminId, dbId);

      const newUserInDb = repository.create({
        userId: setRoleDto.userId,
        role: setRoleDto.role,
        databaseId: dbId,
      });

      await repository.save(newUserInDb);
    });
  }

  async getRoleInDatabase(userId: number, databaseId: number) {
    const [user] = await this.usersDatabasesRepository.find({
      where: { userId, databaseId },
    });

    return { role: user.role };
  }

  async addTable(userId: number, databaseId: number, tableName: string) {
    return this.entityManager.transaction(async (manager) => {
      const tableUuid = createTableId();

      const tableRepository = manager.getRepository(Table);

      await this.checkIfAdminOrThrow(manager, userId, databaseId);

      const newTable = tableRepository.create({
        databaseId,
        name: tableName,
        id: tableUuid,
        columns: [],
      });

      await manager.save(newTable);

      const dynTableRepository = this.dynTableFactory.create(manager);
      await dynTableRepository.createTable(newTable);
      await dynTableRepository.createSortIndex(newTable.id);

      await this.changelogService.recordTableWasAdded(manager, {
        userId,
        tableId: tableUuid,
      });

      return newTable;
    });
  }

  importTableFromExcel(
    userId: number,
    databaseId: number,
    tableName: string,
    file: Express.Multer.File,
  ) {
    return this.entityManager.transaction(async (manager) => {
      const tableUuid = createTableId();

      const tableRepository = manager.getRepository(Table);

      await this.checkIfAdminOrThrow(manager, userId, databaseId);

      const fileData = this.excelReaderService.readFileData(file);

      const cols: Table['columns'] = fileData[0].map((name) => ({
        id: createColId(),
        type: 'text',
        name: String(name),
        enum: [],
      }));

      const newTable = tableRepository.create({
        databaseId,
        name: tableName,
        id: tableUuid,
        columns: cols,
      });

      await manager.save(newTable);

      const dynTableRepository = this.dynTableFactory.create(manager);

      await dynTableRepository.createTable(newTable);

      await dynTableRepository.createSortIndex(newTable.id);

      const colsIds = cols.map(({ id }) => id);

      const values = fileData.slice(1, fileData.length);

      await dynTableRepository.addRowsToUserTableQuery(
        newTable.id,
        colsIds,
        values,
      );

      return { tableId: newTable.id };
    });
  }

  createChart(createChartDto: CreateChartDto, userId: number, dbId: number) {
    return this.entityManager.transaction(async (manager) => {
      const chartEntity = manager.getRepository(ChartEntity);

      await this.checkIfAdminOrThrow(manager, userId, dbId);

      const newChart = chartEntity.create({
        name: createChartDto.name,
        config: createChartDto.config,
        databaseId: dbId,
      });

      await manager.save(newChart);

      if (createChartDto.chartBindings.length > 0) {
        await manager.getRepository(ChartBindingsEntity).insert(
          createChartDto.chartBindings.map((binding) => ({
            chartId: newChart.id,
            tableId: binding.tableId,
            columnId: binding.columnId,
            bindingKey: binding.bindingKey,
          })),
        );
      }

      return newChart.id;
    });
  }

  getTables(databaseId: number) {
    return this.tableRepository.find({ where: { databaseId } });
  }

  private async checkIfAdminOrThrow(
    manager: EntityManager,
    userId: number,
    databaseId: number,
  ) {
    const userDbRoleRepository = manager.getRepository(UsersDatabases);

    const [possibleAdmin] = await userDbRoleRepository.find({
      where: { userId, databaseId },
      lock: { mode: 'pessimistic_write' },
    });

    if (possibleAdmin.role !== 'admin') {
      throw new ForbiddenException({
        message: 'You are not the admin of this database',
      });
    }
  }
}

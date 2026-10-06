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

    const databasesWithTables = databases.map((db) => {
      return {
        id: db.id,
        role: databaseRoleMap.get(db.id),
        name: db.name,
        tables: dbTablesMap.get(db.id) ?? [],
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

      const [possibleAdmin] = await repository.find({
        where: { userId: adminId, databaseId: dbId },
        lock: { mode: 'pessimistic_write' },
      });

      if (possibleAdmin.role !== 'admin') {
        throw new ForbiddenException({
          message: 'You are not the admin of this database',
        });
      }

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
}

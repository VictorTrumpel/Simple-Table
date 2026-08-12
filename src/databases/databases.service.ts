import { Injectable } from '@nestjs/common';
import { IsNull, Repository, In } from 'typeorm';
import { Database } from './entities/database.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersDatabases } from './entities/usersDatabases.entity';
import { CreateDatabaseDto } from './dto/CreateDatabaseDto';
import { Table } from 'src/tables/entities/table.entity';

@Injectable()
export class DatabasesService {
  constructor(
    @InjectRepository(Database)
    private readonly databasesRepository: Repository<Database>,
    @InjectRepository(UsersDatabases)
    private readonly usersDatabasesRepository: Repository<UsersDatabases>,
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
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
}

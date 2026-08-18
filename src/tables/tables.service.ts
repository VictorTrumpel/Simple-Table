import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTableDto } from './dto/CreateTableDto';
import { Repository } from 'typeorm';
import { Table } from './entities/table.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { AddColumnDto } from './dto/AddColumnDto';

@Injectable()
export class TablesService {
  private userTableSpace = 'users_tablespace';

  constructor(
    @InjectRepository(Table)
    private readonly tablesRepository: Repository<Table>,
  ) {}

  async create(createTableDto: CreateTableDto) {
    return this.tablesRepository.manager.transaction(async (manager) => {
      const tableUuid = `t_${randomUUID().replaceAll('-', '')}`;

      const table = this.tablesRepository.create({
        ...createTableDto,
        id: tableUuid,
        columns: [],
      });

      await manager.save(table);

      await manager.query(this.CreateUserTableQuery(table));

      return table;
    });
  }

  async getTableMetadataById(tableId: string) {
    return await this.tablesRepository.findOneBy({ id: tableId });
  }

  async getTableDataById(tableId: string) {
    const tableMeta = await this.getTableMetadataById(tableId);

    if (!tableMeta) throw new NotFoundException('Таблица не найдена');

    const rows: [][] = await this.tablesRepository.manager.query(
      this.GetUserTableQuery(tableId),
    );

    return {
      table: { ...tableMeta },
      rows,
    };
  }

  async deleteTable(tableId: string) {
    const result = await this.tablesRepository.softDelete({
      id: tableId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Таблица не найдена');
    }
  }

  async addColumn(addColumn: AddColumnDto) {
    return await this.tablesRepository.manager.transaction(async (manager) => {
      const repository = manager.getRepository(Table);

      const table = await repository.findOne({
        where: { id: addColumn.tableId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!table) {
        throw new NotFoundException('Таблица не найдена');
      }

      const newColumn = {
        id: `c_${randomUUID().replaceAll('-', '')}`,
        ...addColumn.column,
      };

      await manager.query(`
        alter table "${this.userTableSpace}"."${table.id}" 
        add column "${newColumn.id}" text 
      `);

      table.columns = [...table.columns, newColumn];

      await repository.save(table);

      return newColumn;
    });
  }

  private GetUserTableQuery(tableId: string) {
    return `
      select * 
      from users_tablespace.${tableId}
      where deleted_at is null
      order by sort_index
    `;
  }

  private CreateUserTableQuery(table: Table) {
    return `
      create table ${this.userTableSpace}.${table.id} (
        id bigserial primary key, 
        sort_index bigserial not null, 
        sort_index_version bigint not null default 0,
        ${table.columns.map((col) => `${col.id} text`).join(',')}
        ${table.columns.length ? ',' : ''}
        deleted_at timestamp with time zone
      )
    `;
  }
}

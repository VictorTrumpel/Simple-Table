import { Injectable } from '@nestjs/common';
import { CreateTableDto } from './dto/CreateTableDto';
import { Repository } from 'typeorm';
import { Table } from './entities/table.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';

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

      const createUserTableSqlExpression = this.createUserTableSql(table);

      await manager.query(createUserTableSqlExpression);

      return table;
    });
  }

  async getTableById(tableId: string) {
    console.log('tableId :>> ', tableId);
    return await this.tablesRepository.findOneBy({ id: tableId });
  }

  private createUserTableSql(table: Table) {
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

import { Injectable } from '@nestjs/common';
import { CreateTableDto } from './dto/CreateTableDto';
import { Repository } from 'typeorm';
import { Table } from './entities/table.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';

@Injectable()
export class TablesService {
  constructor(
    @InjectRepository(Table)
    private readonly tablseRepository: Repository<Table>,
  ) {}

  async create(createTableDto: CreateTableDto) {
    const tableUuid = `t_${randomUUID().replaceAll('-', '')}`;

    const table = this.tablseRepository.create({
      ...createTableDto,
      id: tableUuid,
      columns: [],
    });

    await this.tablseRepository.save(table);

    return table;
  }
}

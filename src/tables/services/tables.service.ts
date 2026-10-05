import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Table } from '../entities/table.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { GetTableDto } from '../dto/GetTableDto';
import { ExcleReaderService } from './excelReader.service';
import { ReadQueryTableDto } from '../dto/ReadQueryTableDto';
import { DynTableFactory } from '../repository/dynTable.repository';
import { pickColsFromRows } from '../utils/pickColsFromRows';
import { findTableOrTrhow } from '../utils/findTableOrTrhow';
import { DataSource } from 'typeorm';

@Injectable()
export class TablesService {
  constructor(
    @InjectRepository(Table)
    private readonly tablesRepository: Repository<Table>,
    private readonly excelReaderService: ExcleReaderService,
    private readonly dynTableFactory: DynTableFactory,
    private readonly dataSource: DataSource,
  ) {}

  async getTable(tableId: string) {
    const table = await findTableOrTrhow(
      tableId,
      this.tablesRepository.manager,
      false,
    );

    return table;
  }

  async deleteTable(tableId: string) {
    const result = await this.tablesRepository.softDelete({
      id: tableId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Таблица не найдена');
    }
  }

  async readTable(
    tableId: string,
    readTableQuery: ReadQueryTableDto,
  ): Promise<GetTableDto> {
    return this.dataSource.transaction(async (manager) => {
      const tableMeta = await findTableOrTrhow(tableId, manager);

      const dynTableRepository = this.dynTableFactory.create(manager);

      const tableRows = await dynTableRepository.readTable(
        tableId,
        readTableQuery,
      );

      const totalRows = await dynTableRepository.getTotalRowsOfTable(
        tableId,
        readTableQuery,
      );

      const rows = pickColsFromRows(tableMeta, tableRows);

      return {
        table: { ...tableMeta, totalRows },
        rows,
      };
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTableDto } from '../dto/CreateTableDto';
import { Repository } from 'typeorm';
import { Table } from '../entities/table.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { GetTableDto } from '../dto/GetTableDto';
import { ExcleReaderService } from './excelReader.service';
import { ReadQueryTableDto } from '../dto/ReadQueryTableDto';
import { DynTableFactory } from '../repository/dynTable.repository';
import { pickColsFromRows } from '../utils/pickColsFromRows';
import { findTableOrTrhow } from '../utils/findTableOrTrhow';
import { DataSource } from 'typeorm';
import { createColId } from '../utils/createColId';
import { createTableId } from '../utils/createTableId';
import { ChangelogService } from 'src/changelog/changelog.service';

@Injectable()
export class TablesService {
  constructor(
    @InjectRepository(Table)
    private readonly tablesRepository: Repository<Table>,
    private readonly excelReaderService: ExcleReaderService,
    private readonly dynTableFactory: DynTableFactory,
    private readonly dataSource: DataSource,
    private readonly changelogService: ChangelogService,
  ) {}

  async create(createTableDto: CreateTableDto, userId: number) {
    return this.tablesRepository.manager.transaction(async (manager) => {
      const tableUuid = `t_${randomUUID().replaceAll('-', '')}`;

      const table = this.tablesRepository.create({
        ...createTableDto,
        id: tableUuid,
        columns: [],
      });

      await manager.save(table);

      const dynTableRepository = this.dynTableFactory.create(manager);

      await dynTableRepository.createTable(table);
      await dynTableRepository.createSortIndex(table.id);

      await this.changelogService.recordTableWasAdded(manager, {
        userId,
        tableId: tableUuid,
      });

      return table;
    });
  }

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

  importTableFromExcel(
    file: Express.Multer.File,
    createTableDto: CreateTableDto,
  ) {
    return this.tablesRepository.manager.transaction(async (manager) => {
      const fileData = this.excelReaderService.readFileData(file);

      const cols: Table['columns'] = fileData[0].map((name) => ({
        id: createColId(),
        type: 'text',
        name: String(name),
      }));

      const newTable = this.createTable(createTableDto, cols);

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

  private createTable(
    createTableDto: CreateTableDto,
    columns: Table['columns'] = [],
  ) {
    const tableUuid = createTableId();

    const table = this.tablesRepository.create({
      ...createTableDto,
      id: tableUuid,
      columns,
    });

    return table;
  }
}

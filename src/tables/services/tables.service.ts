import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTableDto } from '../dto/CreateTableDto';
import { Repository, EntityManager } from 'typeorm';
import { Table } from '../entities/table.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { AddRowDto } from '../dto/AddRowDto';
import { GetTableDto, TableRowDto } from '../dto/GetTableDto';
import { DeleteRowsDto } from '../dto/DeleteRowsDto';
import { UserTable } from '../entities/userTable.entity';
import { ExcleReaderService } from './excelReader.service';
import { ReadQueryTableDto } from '../dto/ReadQueryTableDto';
import { SetCellValueDto } from '../dto/SetCellValueDto';

@Injectable()
export class TablesService {
  constructor(
    @InjectRepository(Table)
    private readonly tablesRepository: Repository<Table>,
    private readonly excelReaderService: ExcleReaderService,
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

      const userTable = this.createUserTableRepository(
        this.tablesRepository.manager,
      );

      await userTable.createUserTableQuery(table);

      await userTable.createSortIndex(table.id);

      return table;
    });
  }

  async getTableMetadataById(tableId: string) {
    const table = await this.findTableOrThrowExeption(
      tableId,
      this.tablesRepository,
      false,
    );

    return table;
  }

  async readTable(
    tableId: string,
    readTableQuery: ReadQueryTableDto,
  ): Promise<GetTableDto> {
    const tableMeta = await this.getTableMetadataById(tableId);

    const userTable = this.createUserTableRepository(
      this.tablesRepository.manager,
    );

    const tableRows = await userTable.readTable(tableId, readTableQuery);

    const totalRows = await userTable.getTotalRowsOfTable(
      tableId,
      readTableQuery,
    );

    const rows = this.pickColsFromRows(tableMeta, tableRows);

    return {
      table: { ...tableMeta, totalRows },
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

  importTableFromExcel(
    file: Express.Multer.File,
    createTableDto: CreateTableDto,
  ) {
    return this.tablesRepository.manager.transaction(async (manager) => {
      const fileData = this.excelReaderService.readFileData(file);

      const cols: Table['columns'] = fileData[0].map((name) => ({
        id: this.createColId(),
        type: 'text',
        name: String(name),
      }));

      const newTable = this.createTable(createTableDto, cols);

      await manager.save(newTable);

      const newUserTable = this.createUserTableRepository(manager);

      await newUserTable.createUserTableQuery(newTable);

      await newUserTable.createSortIndex(newTable.id);

      const colsIds = cols.map(({ id }) => id);

      const values = fileData.slice(1, fileData.length);

      await newUserTable.addRowsToUserTableQuery(newTable.id, colsIds, values);

      return { tableId: newTable.id };
    });
  }

  async setCellValue(tableId: string, setCellValue: SetCellValueDto) {
    return this.tablesRepository.manager.transaction(async (manager) => {
      const repository = manager.getRepository(Table);

      const table = await this.findTableOrThrowExeption(
        tableId,
        repository,
        false,
      );

      const columnExist = table.columns.some(
        (c) => c.id === setCellValue.columnId,
      );

      if (!columnExist) {
        throw new NotFoundException({
          message: `column with id ${setCellValue.columnId} does not exist`,
        });
      }

      const userTable = this.createUserTableRepository(
        this.tablesRepository.manager,
      );

      const updatedRows = await userTable.setCellValue(tableId, setCellValue);

      const rows = this.pickColsFromRows(table, updatedRows);

      return { rows };
    });
  }

  private pickColsFromRows(tableMeta: Table, rows: Record<string, unknown>[]) {
    const colsIds = tableMeta.columns.map((col) => col.id);

    const rowsMatchedWithColumns = rows.map((row) => {
      const filteredRow: TableRowDto = {
        id: String(row.id),
        data: {},
      };

      colsIds.forEach((colId) => {
        filteredRow.data[colId] = row[colId];
      });

      return filteredRow;
    });

    return rowsMatchedWithColumns;
  }

  private createColId() {
    return `c_${randomUUID().replaceAll('-', '')}`;
  }

  private createTable(
    createTableDto: CreateTableDto,
    columns: Table['columns'] = [],
  ) {
    const tableUuid = `t_${randomUUID().replaceAll('-', '')}`;

    const table = this.tablesRepository.create({
      ...createTableDto,
      id: tableUuid,
      columns,
    });

    return table;
  }

  private async findTableOrThrowExeption(
    tableId: string,
    repository: Repository<Table>,
    lock = true,
  ) {
    const table = await repository.findOne({
      where: { id: tableId },
      ...(lock ? { lock: { mode: 'pessimistic_write' } } : {}),
    });

    if (!table) {
      throw new NotFoundException({ message: 'Таблица не найдена' });
    }

    return table;
  }

  private createUserTableRepository(manager: EntityManager) {
    return new UserTable(manager);
  }
}

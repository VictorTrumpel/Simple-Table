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
import { AddColumnDto } from '../dto/AddColumnDto';
import { AddRowDto } from '../dto/AddRowDto';
import { GetTableDto, TableRowDto } from '../dto/GetTableDto';
import { DeleteRowsDto } from '../dto/DeleteRowsDto';
import { EditColumnDto } from '../dto/EditColumnDto';
import { UserTable } from '../entities/userTable.entity';
import { ExcleReaderService } from './excelReader.service';
import { ReadQueryTableDto } from '../dto/ReadQueryTableDto';

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

    const colsIds = tableMeta.columns.map((col) => col.id);

    const userTable = this.createUserTableRepository(
      this.tablesRepository.manager,
    );

    const tableRows = await userTable.readTable(tableId, readTableQuery);
    const totalRows = await userTable.getTotalRowsOfTable(tableId);

    const rowsMatchedWithColumns = tableRows.map((row) => {
      const filteredRow: TableRowDto = {
        id: String(row.id),
        data: {},
      };

      colsIds.forEach((colId) => {
        filteredRow.data[colId] = row[colId];
      });

      return filteredRow;
    });

    return {
      table: { ...tableMeta, totalRows },
      rows: rowsMatchedWithColumns,
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

      const table = await this.findTableOrThrowExeption(
        addColumn.tableId,
        repository,
        false,
      );

      const newColumn = {
        id: this.createColId(),
        ...addColumn.column,
      };

      const userTable = this.createUserTableRepository(
        this.tablesRepository.manager,
      );

      await userTable.addCol(table.id, newColumn.id);

      table.columns = [...table.columns, newColumn];

      await repository.save(table);

      return newColumn;
    });
  }

  async addRow(addRowDto: AddRowDto) {
    const table = await this.findTableOrThrowExeption(
      addRowDto.tableId,
      this.tablesRepository,
      false,
    );

    const tableColumns = table.columns;

    const allowedColumnsIds = new Set(tableColumns.map((col) => col.id));

    const updatedColIds = Object.keys(addRowDto.data);

    const invalidCols = updatedColIds.filter(
      (colId) => !allowedColumnsIds.has(colId),
    );

    if (invalidCols.length > 0) {
      throw new BadRequestException({
        message: 'Переданы неизвестные колонки',
        columns: invalidCols,
      });
    }

    if (updatedColIds.length === 0) {
      throw new BadRequestException({
        message: 'Строка не содержит данных',
      });
    }

    const manager = this.tablesRepository.manager;
    const colValues = updatedColIds.map((colId) => addRowDto.data[colId]);

    const userTable = this.createUserTableRepository(manager);
    const newRow = await userTable.addRowToUserTableQuery(
      table.id,
      updatedColIds,
      colValues,
    );

    return newRow;
  }

  async deleteRows(tableId: string, deleteRowsDto: DeleteRowsDto) {
    return await this.tablesRepository.manager.transaction(async (manager) => {
      const repository = manager.getRepository(Table);

      const table = await this.findTableOrThrowExeption(tableId, repository);

      const userTableRepository = this.createUserTableRepository(manager);
      const deletedRows =
        await userTableRepository.deleteRowsFromUserTableQuery(
          table.id,
          deleteRowsDto.rowIds,
        );

      const deletedRowsIds = new Set(deletedRows.map((r) => r.id));

      const missingIds = deleteRowsDto.rowIds.filter(
        (id) => !deletedRowsIds.has(id),
      );

      if (missingIds.length > 0) {
        throw new NotFoundException({
          message: 'Удаляемых строк не существует',
          rows: missingIds,
        });
      }

      return { deletedCount: deletedRowsIds.size };
    });
  }

  async deleteColumn(tableId: string, columnIdForDelete: string) {
    return await this.tablesRepository.manager.transaction(async (manager) => {
      const repository = manager.getRepository(Table);

      const table = await this.findTableOrThrowExeption(tableId, repository);

      const currentColumns = table.columns;

      const column = currentColumns.find((c) => c.id === columnIdForDelete);

      if (!column) {
        throw new NotFoundException({
          message: `Колонка с id ${columnIdForDelete} не найдена`,
        });
      }

      const userTableRepository = this.createUserTableRepository(manager);
      await userTableRepository.deleteColFromUserTableQuery(
        tableId,
        columnIdForDelete,
      );

      table.columns = table.columns.filter((c) => c.id !== columnIdForDelete);

      await manager.save(Table, table);
    });
  }

  async editColumn(editColumnDto: EditColumnDto) {
    return this.tablesRepository.manager.transaction(async (manager) => {
      const repository = manager.getRepository(Table);

      const table = await this.findTableOrThrowExeption(
        editColumnDto.tableId,
        repository,
      );

      const currentColumns = table.columns;

      const column = currentColumns.find(
        (c) => c.id === editColumnDto.column.id,
      );

      if (!column) {
        throw new NotFoundException({
          message: `Колонка с id ${editColumnDto.column.id} не найдена`,
        });
      }

      const updatedColumn = {
        ...column,
        ...editColumnDto.column,
      };

      table.columns = table.columns.map((col) => {
        if (col.id === updatedColumn.id) {
          return updatedColumn;
        }
        return col;
      });

      await manager.save(Table, table);

      return updatedColumn;
    });
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

import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Put,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import type { Express } from 'express';
import { TablesService } from './services/tables.service';
import { CreateTableDto } from './dto/CreateTableDto';
import { AddColumnDto } from './dto/AddColumnDto';
import { AddRowDto } from './dto/AddRowDto';
import { DeleteRowsDto } from './dto/DeleteRowsDto';
import { EditColumnDto } from './dto/EditColumnDto';
import { SetCellValueDto } from './dto/SetCellValueDto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateTableFormDataDto } from './dto/CreateTableFormDataDto';
import { ReadQueryTableDto } from './dto/ReadQueryTableDto';
import { TableColumnsService } from './services/tableColumns.service';

@Controller('tables')
export class TablesController {
  constructor(
    private readonly tablesService: TablesService,
    private readonly tableColumnsService: TableColumnsService,
  ) {}

  @Post('/create')
  create(@Body() createTableDto: CreateTableDto) {
    return this.tablesService.create(createTableDto);
  }

  @Get('/:tableId/info')
  getMetadata(@Param('tableId') tableId: string) {
    return this.tablesService.getTableMetadataById(tableId);
  }

  @Get('/:tableId')
  getData(
    @Param('tableId') tableId: string,
    @Query() readQuery: ReadQueryTableDto,
  ) {
    return this.tablesService.readTable(tableId, readQuery);
  }

  @Delete('/delete/:tableId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteTable(@Param('tableId') tableId: string) {
    return this.tablesService.deleteTable(tableId);
  }

  @Post('/add-column')
  addColumn(@Body() addColumnDto: AddColumnDto) {
    return this.tableColumnsService.addColumn(addColumnDto);
  }

  @Delete('/delete/:tableId/:colId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteColumn(
    @Param('tableId') tableId: string,
    @Param('colId') colId: string,
  ) {
    return this.tableColumnsService.deleteColumn(tableId, colId);
  }

  @Put('/edit-column')
  editColumn(@Body() editColumnDto: EditColumnDto) {
    return this.tableColumnsService.editColumn(editColumnDto);
  }

  @Post('/:tableId/add-row')
  addRow(@Body() addRowDto: AddRowDto) {
    return this.tablesService.addRow(addRowDto);
  }

  @Post('/:tableId/delete-rows')
  @HttpCode(HttpStatus.OK)
  deleteRows(
    @Param('tableId') tableId: string,
    @Body() deleteRowsDto: DeleteRowsDto,
  ) {
    return this.tablesService.deleteRows(tableId, deleteRowsDto);
  }

  @Put('/:tableId/set-cell-value')
  setCellValue(
    @Param('tableId') tableId: string,
    @Body() setCellValueDto: SetCellValueDto,
  ) {
    return this.tablesService.setCellValue(tableId, setCellValueDto);
  }

  @Post('/import')
  @UseInterceptors(FileInterceptor('file'))
  importTableByExcel(
    @UploadedFile() file: Express.Multer.File,
    @Body() importTableDto: CreateTableFormDataDto,
  ) {
    return this.tablesService.importTableFromExcel(file, {
      ...importTableDto,
      databaseId: Number(importTableDto.databaseId),
    });
  }
}

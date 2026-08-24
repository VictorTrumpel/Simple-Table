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
} from '@nestjs/common';
import type { Express } from 'express';
import { TablesService } from './services/tables.service';
import { CreateTableDto } from './dto/CreateTableDto';
import { AddColumnDto } from './dto/AddColumnDto';
import { AddRowDto } from './dto/AddRowDto';
import { DeleteRowsDto } from './dto/DeleteRowsDto';
import { EditColumnDto } from './dto/EditColumnDto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateTableFormDataDto } from './dto/CreateTableFormDataDto';

@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Post('/create')
  create(@Body() createTableDto: CreateTableDto) {
    return this.tablesService.create(createTableDto);
  }

  @Get('/:tableId/info')
  getMetadata(@Param('tableId') tableId: string) {
    return this.tablesService.getTableMetadataById(tableId);
  }

  @Get('/:tableId')
  getData(@Param('tableId') tableId: string) {
    return this.tablesService.getTableDataById(tableId);
  }

  @Delete('/delete/:tableId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteTable(@Param('tableId') tableId: string) {
    return this.tablesService.deleteTable(tableId);
  }

  @Post('/add-column')
  addColumn(@Body() addColumnDto: AddColumnDto) {
    return this.tablesService.addColumn(addColumnDto);
  }

  @Delete('/delete/:tableId/:colId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteColumn(
    @Param('tableId') tableId: string,
    @Param('colId') colId: string,
  ) {
    return this.tablesService.deleteColumn(tableId, colId);
  }

  @Put('/edit-column')
  editColumn(@Body() editColumnDto: EditColumnDto) {
    return this.tablesService.editColumn(editColumnDto);
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

import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/CreateTableDto';
import { AddColumnDto } from './dto/AddColumnDto';
import { AddRowDto } from './dto/AddRowDto';

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

  @Post('/:tableId/add-row')
  addRow(@Body() addRowDto: AddRowDto) {
    return this.tablesService.addRow(addRowDto);
  }
}

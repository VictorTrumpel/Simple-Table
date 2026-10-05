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
  Query,
  UseGuards,
} from '@nestjs/common';
import { TablesService } from './services/tables.service';
import { AddColumnDto } from './dto/AddColumnDto';
import { AddRowDto } from './dto/AddRowDto';
import { DeleteRowsDto } from './dto/DeleteRowsDto';
import { EditColumnDto } from './dto/EditColumnDto';
import { SetCellValueDto } from './dto/SetCellValueDto';
import { ReadQueryTableDto } from './dto/ReadQueryTableDto';
import { TableColumnsService } from './services/tableColumns.service';
import { TableRowsService } from './services/tableRows.service';
import { TableCellService } from './services/tableCell.service';
import { CurrentUserId } from 'src/auth/decorators/CurrentUserId';
import { TableGuard } from './guards/TableGuard';

@Controller('tables')
@UseGuards(TableGuard)
export class TablesController {
  constructor(
    private readonly tablesService: TablesService,
    private readonly tableColumnsService: TableColumnsService,
    private readonly tableRowsService: TableRowsService,
    private readonly tableCellService: TableCellService,
  ) {}

  @Get('/:tableId/info')
  getMetadata(@Param('tableId') tableId: string) {
    return this.tablesService.getTable(tableId);
  }

  @Get('/:tableId')
  getData(
    @Param('tableId') tableId: string,
    @Query() readQuery: ReadQueryTableDto,
  ) {
    return this.tablesService.readTable(tableId, readQuery);
  }

  @Delete('/:tableId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteTable(@Param('tableId') tableId: string) {
    return this.tablesService.deleteTable(tableId);
  }

  @Post('/:tableId/add-column')
  addColumn(
    @Param('tableId') tableId: string,
    @Body() addColumnDto: AddColumnDto,
    @CurrentUserId() userId: string,
  ) {
    return this.tableColumnsService.addColumn(addColumnDto, userId, tableId);
  }

  @Delete('/:tableId/:colId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteColumn(
    @Param('tableId') tableId: string,
    @Param('colId') colId: string,
    @CurrentUserId() userId: string,
  ) {
    return this.tableColumnsService.deleteColumn(tableId, colId, userId);
  }

  @Put('/:tableId/edit-column')
  editColumn(
    @Param('tableId') tableId: string,
    @Body() editColumnDto: EditColumnDto,
    @CurrentUserId() userId: string,
  ) {
    return this.tableColumnsService.editColumn(editColumnDto, userId, tableId);
  }

  @Post('/:tableId/add-row')
  addRow(
    @Param('tableId') tableId: string,
    @Body() addRowDto: AddRowDto,
    @CurrentUserId() userId: string,
  ) {
    return this.tableRowsService.addRow(addRowDto, userId, tableId);
  }

  @Post('/:tableId/delete-rows')
  @HttpCode(HttpStatus.OK)
  deleteRows(
    @Param('tableId') tableId: string,
    @Body() deleteRowsDto: DeleteRowsDto,
    @CurrentUserId() userId: string,
  ) {
    return this.tableRowsService.deleteRows(tableId, deleteRowsDto, userId);
  }

  @Put('/:tableId/set-cell-value')
  setCellValue(
    @Param('tableId') tableId: string,
    @Body() setCellValueDto: SetCellValueDto,
    @CurrentUserId() userId: string,
  ) {
    return this.tableCellService.setCellValue(tableId, setCellValueDto, userId);
  }
}

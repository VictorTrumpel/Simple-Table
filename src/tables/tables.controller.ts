import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/CreateTableDto';

@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Post('/create')
  create(@Body() createTableDto: CreateTableDto) {
    return this.tablesService.create(createTableDto);
  }

  @Get('/:tableId/info')
  get(@Param('tableId') tableId: string) {
    return this.tablesService.getTableById(tableId);
  }
}

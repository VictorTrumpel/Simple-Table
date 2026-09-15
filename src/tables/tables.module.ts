import { Module } from '@nestjs/common';
import { TablesController } from './tables.controller';
import { TablesService } from './services/tables.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Table } from './entities/table.entity';
import { ExcleReaderService } from './services/excelReader.service';
import { TableColumnsService } from './services/tableColumns.service';
import { DynTableFactory } from './repository/dynTable.repository';
import { TableRowsService } from './services/tableRows.service';
import { TableCellService } from './services/tableCell.service';

@Module({
  imports: [TypeOrmModule.forFeature([Table])],
  controllers: [TablesController],
  providers: [
    TablesService,
    ExcleReaderService,
    TableColumnsService,
    TableRowsService,
    DynTableFactory,
    TableCellService,
  ],
})
export class TablesModule {}

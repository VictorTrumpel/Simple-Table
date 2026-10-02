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
import { ChangelogModule } from 'src/changelog/changelog.module';
import { TableGateway } from './tables.gateway';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([Table]), ChangelogModule, RedisModule],
  controllers: [TablesController],
  providers: [
    TablesService,
    ExcleReaderService,
    TableColumnsService,
    TableRowsService,
    DynTableFactory,
    TableCellService,
    TableGateway,
  ],
})
export class TablesModule {}

import { Module } from '@nestjs/common';
import { TablesController } from './tables.controller';
import { TablesService } from './services/tables.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Table } from './entities/table.entity';
import { ExcleReaderService } from './services/excelReader.service';
import { TableColumnsService } from './services/tableColumns.service';
import {
  DynTableFactory,
  DynTableRepository,
} from './repository/dynTable.repository';
import { TableRowsService } from './services/tableRows.service';
import { TableCellService } from './services/tableCell.service';
import { ChangelogModule } from 'src/changelog/changelog.module';
import { TableGateway } from './tables.gateway';
import { RedisModule } from 'src/redis/redis.module';
import { UsersDatabases } from 'src/databases/entities/usersDatabases.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Table, UsersDatabases]),
    ChangelogModule,
    RedisModule,
    AuthModule,
  ],
  controllers: [TablesController, TableGateway],
  providers: [
    TablesService,
    ExcleReaderService,
    TableColumnsService,
    TableRowsService,
    DynTableFactory,
    DynTableRepository,
    TableCellService,
    TableGateway,
  ],
  exports: [DynTableFactory, ExcleReaderService],
})
export class TablesModule {}

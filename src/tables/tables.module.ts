import { Module } from '@nestjs/common';
import { TablesController } from './tables.controller';
import { TablesService } from './services/tables.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Table } from './entities/table.entity';
import { ExcleReaderService } from './services/excelReader.service';

@Module({
  imports: [TypeOrmModule.forFeature([Table])],
  controllers: [TablesController],
  providers: [TablesService, ExcleReaderService],
})
export class TablesModule {}

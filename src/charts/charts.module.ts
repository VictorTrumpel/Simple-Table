import { Module } from '@nestjs/common';
import { ChartsService } from './charts.service';
import { ChartsController } from './charts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChartBindingsEntity } from './entities/chartBindings.entity';
import { Table } from 'src/tables/entities/table.entity';
import { ChartEntity } from './entities/chart.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChartBindingsEntity, Table, ChartEntity]),
  ],
  controllers: [ChartsController],
  providers: [ChartsService],
})
export class ChartsModule {}

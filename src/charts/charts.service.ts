import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBindingDto } from './dto/CreateBindingDto';
import { EntityManager, Repository } from 'typeorm';
import { Table } from 'src/tables/entities/table.entity';
import { ChartBindingsEntity } from './entities/chartBindings.entity';
import { ChartEntity } from './entities/chart.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ChartsService {
  constructor(
    private entityManager: EntityManager,
    @InjectRepository(ChartBindingsEntity)
    private bindingRepository: Repository<ChartBindingsEntity>,
  ) {}

  createBindingDto(chartId: number, createBindingDto: CreateBindingDto) {
    return this.entityManager.transaction(async (manager) => {
      const tableRepository = manager.getRepository(Table);

      const tableMeta = await tableRepository.findOneBy({
        id: createBindingDto.tableId,
      });

      if (!tableMeta) {
        throw new NotFoundException({
          message: `Таблицы с id ${createBindingDto.tableId} не существует`,
        });
      }

      const hasColumn = tableMeta.columns.find(
        (c) => c.id === createBindingDto.columnId,
      );

      if (!hasColumn) {
        throw new NotFoundException({
          message: `Колонки с id ${createBindingDto.columnId} не существует`,
        });
      }

      const chartRepository = manager.getRepository(ChartEntity);

      const chart = await chartRepository.findOneBy({ id: chartId });

      if (!chart) {
        throw new NotFoundException({
          message: `Графика с id ${chartId} не существует`,
        });
      }

      const bindingRepository = manager.getRepository(ChartBindingsEntity);

      const newBinding = bindingRepository.create({
        chartId,
        ...createBindingDto,
      });

      await bindingRepository.save(newBinding);

      return newBinding;
    });
  }

  getBindings(chartId: number) {
    return this.bindingRepository.find({ where: { chartId } });
  }
}

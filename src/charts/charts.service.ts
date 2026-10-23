import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBindingDto } from './dto/CreateBindingDto';
import { EntityManager, Repository } from 'typeorm';
import { Table } from 'src/tables/entities/table.entity';
import { ChartBindingsEntity } from './entities/chartBindings.entity';
import { ChartEntity } from './entities/chart.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DynTableFactory } from 'src/tables/repository/dynTable.repository';

@Injectable()
export class ChartsService {
  constructor(
    private entityManager: EntityManager,
    @InjectRepository(ChartBindingsEntity)
    private bindingRepository: Repository<ChartBindingsEntity>,
    @InjectRepository(ChartEntity)
    private chartRepository: Repository<ChartEntity>,
    private dynTableFactory: DynTableFactory,
  ) {}

  getChartMeta(chartId: number) {
    return this.chartRepository.findOneBy({ id: chartId });
  }

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

  deleteChart(chartId: number) {
    return this.entityManager.transaction(async (manager) => {
      const chartRepo = manager.getRepository(ChartEntity);
      const chartBindingRepo = manager.getRepository(ChartBindingsEntity);

      await chartRepo.delete({ id: chartId });
      await chartBindingRepo.delete({ chartId: chartId });
    });
  }

  deleteBinding(chartId: number, bindingId: number) {
    return this.bindingRepository.delete({ id: bindingId, chartId });
  }

  async updateConfig(chartId: number, config: Record<string, unknown>) {
    const chartMeta = await this.chartRepository.findOneBy({
      id: chartId,
    });

    if (!chartMeta) {
      throw new NotFoundException({
        message: `Chart with id ${chartId} does not exist`,
      });
    }

    chartMeta.config = config;

    await this.chartRepository.save(chartMeta);
  }

  getChartData(chartId: number) {
    return this.entityManager.transaction(async (manager) => {
      const chartRepo = manager.getRepository(ChartEntity);
      const chartBindingRepo = manager.getRepository(ChartBindingsEntity);
      const dyntableRepo = this.dynTableFactory.create(manager);

      const chartMeta = await chartRepo.findOneBy({ id: chartId });

      if (!chartMeta) {
        throw new NotFoundException({
          message: `chart with id ${chartId} not found`,
        });
      }

      const chartBindings = await chartBindingRepo.find({ where: { chartId } });

      const mapTableIdColIds = new Map<string, string[]>();

      chartBindings.forEach((bind) => {
        const { tableId, columnId } = bind;

        const currentColIds = mapTableIdColIds.get(tableId) ?? [];

        mapTableIdColIds.set(tableId, [...currentColIds, columnId]);
      });

      const tableList: Record<string, unknown>[][] = [];

      for (const tableId of mapTableIdColIds.keys()) {
        const cols = mapTableIdColIds.get(tableId);

        if (!cols) continue;

        const table = await dyntableRepo.readTableWithCols(
          tableId,
          cols,
          mapTableIdColIds.size > 1,
        );

        tableList.push(table);
      }

      const unionTable: Record<string, unknown>[] = [];

      const maxRowIdx = Math.max(...tableList.map((t) => t.length));
      for (let rowIdx = 0; rowIdx < maxRowIdx; rowIdx++) {
        for (const table of tableList) {
          unionTable[rowIdx] = {
            ...unionTable[rowIdx],
            ...table[rowIdx],
          };
        }
      }

      return unionTable;
    });
  }
}

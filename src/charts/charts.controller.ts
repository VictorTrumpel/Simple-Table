import {
  Body,
  Controller,
  Param,
  Post,
  Get,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CreateBindingDto } from './dto/CreateBindingDto';
import { ChartsService } from './charts.service';
import { UpdateConfigDto } from './dto/UpdateConfigDto';
import { ChartGuard } from './guards/ChartGuard';

@Controller('charts')
@UseGuards(ChartGuard)
export class ChartsController {
  constructor(private chartsService: ChartsService) {}

  @Get('/:id')
  getChartMeta(@Param('id') chartId: number) {
    return this.chartsService.getChartMeta(chartId);
  }

  @Post('/:id/binding')
  addBinding(
    @Body() createBindingDto: CreateBindingDto,
    @Param('id') chartId: number,
  ) {
    return this.chartsService.createBindingDto(chartId, createBindingDto);
  }

  @Get('/:id/bindings')
  getList(@Param('id') chartId: number) {
    return this.chartsService.getBindings(chartId);
  }

  @Delete('/:id/bindings/:bindingId')
  deleteBinding(
    @Param('id') chartId: number,
    @Param('bindingId') bindingId: number,
  ) {
    return this.chartsService.deleteBinding(chartId, bindingId);
  }

  @Delete('/:id')
  deleteChart(@Param('id') chartId: number) {
    return this.chartsService.deleteChart(chartId);
  }

  @Put('/:id/config')
  updateChartConfig(
    @Param('id') chartId: number,
    @Body() payload: UpdateConfigDto,
  ) {
    return this.chartsService.updateConfig(chartId, payload.config);
  }

  @Get('/:id/data')
  getChartData(@Param('id') chartId: number) {
    return this.chartsService.getChartData(chartId);
  }
}

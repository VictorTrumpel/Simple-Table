import { Body, Controller, Param, Post, Get, Delete } from '@nestjs/common';
import { CreateBindingDto } from './dto/CreateBindingDto';
import { ChartsService } from './charts.service';

@Controller('charts')
export class ChartsController {
  constructor(private chartsService: ChartsService) {}

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
}

import { Body, Controller, Param, Post, Get } from '@nestjs/common';
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
    console.log('test');
    return this.chartsService.createBindingDto(chartId, createBindingDto);
  }

  @Get('/:id/bindings')
  getList(@Param('id') chartId: number) {
    return this.chartsService.getBindings(chartId);
  }
}

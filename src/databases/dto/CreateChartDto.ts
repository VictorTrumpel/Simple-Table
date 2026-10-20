import {
  IsString,
  IsNotEmpty,
  IsObject,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ChartBindingDto {
  @IsString()
  @IsNotEmpty()
  tableId!: string;

  @IsString()
  @IsNotEmpty()
  columnId!: string;

  @IsString()
  @IsNotEmpty()
  bindingKey!: string;
}

export class CreateChartDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsObject()
  config!: Record<string, unknown>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChartBindingDto)
  chartBindings!: {
    chartId: number;
    tableId: string;
    columnId: string;
    bindingKey: string;
  }[];
}

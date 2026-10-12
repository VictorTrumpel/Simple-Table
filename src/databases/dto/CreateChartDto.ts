import { IsString, IsNotEmpty, IsObject } from 'class-validator';

export class CreateChartDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsObject()
  config!: Record<string, unknown>;
}

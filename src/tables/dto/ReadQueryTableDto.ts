import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class ReadQueryTableDto {
  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  page!: number;

  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  perPage!: number;
}

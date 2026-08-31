import { Type } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class ReadQueryTableDto {
  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  page!: number;

  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  perPage!: number;

  @Type(() => String)
  @IsString()
  @IsOptional()
  sortBy?: string;

  @Type(() => String)
  @IsString()
  @IsIn(['asc', 'desc'])
  @IsOptional()
  sortDir?: 'asc' | 'desc';

  @Type(() => String)
  @IsString()
  @IsOptional()
  filterBy?: string;

  @Type(() => String)
  @IsString()
  @IsOptional()
  filterValue?: string;
}

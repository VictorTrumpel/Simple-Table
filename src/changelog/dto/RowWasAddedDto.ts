import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ChangeRowItemDto {
  @IsNotEmpty()
  @IsString()
  columnID!: string;

  @IsNotEmpty()
  @IsString()
  columnName!: string;

  @IsNotEmpty()
  @IsString()
  value!: string;
}

export class RowWasAddedDto {
  @IsNumber()
  @IsNotEmpty()
  userId!: number;

  @IsString()
  @IsNotEmpty()
  tableId!: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChangeRowItemDto)
  afterRow!: ChangeRowItemDto[];
}

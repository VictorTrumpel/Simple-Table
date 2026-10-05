import {
  IsString,
  IsNotEmpty,
  IsDefined,
  ValidateNested,
  IsIn,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { ColumnType } from '../entities/table.entity';

class ColumnDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['text', 'numeric', 'enum', 'timestamp'])
  type!: ColumnType;

  @IsString({ each: true })
  @IsArray()
  enum: string[] = [];
}

export class AddColumnDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => ColumnDto)
  column!: ColumnDto;
}

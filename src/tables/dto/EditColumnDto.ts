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

class Column {
  @IsNotEmpty()
  @IsString()
  id!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['text', 'numeric', 'enum', 'timestamp'])
  type!: ColumnType;

  @IsString({ each: true })
  @IsArray()
  enum: string[] = [];
}

export class EditColumnDto {
  @IsNotEmpty()
  @IsString()
  tableId!: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => Column)
  column!: Column;
}

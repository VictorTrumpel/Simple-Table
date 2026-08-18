import {
  IsString,
  IsNotEmpty,
  IsDefined,
  ValidateNested,
  IsIn,
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
}

export class AddColumnDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => ColumnDto)
  column!: ColumnDto;

  @IsNotEmpty()
  @IsString()
  tableId!: string;
}

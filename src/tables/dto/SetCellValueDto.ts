import { IsString, IsNotEmpty } from 'class-validator';

export class SetCellValueDto {
  @IsString()
  @IsNotEmpty()
  columnId!: string;

  @IsString()
  @IsNotEmpty()
  rowId!: string;

  @IsString()
  @IsNotEmpty()
  value!: string;
}

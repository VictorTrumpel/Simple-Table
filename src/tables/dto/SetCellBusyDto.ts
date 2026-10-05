import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class SetCellBusyDto {
  @IsString()
  @IsNotEmpty()
  columnId!: string;

  @IsNumber()
  @IsNotEmpty()
  rowId!: number;
}

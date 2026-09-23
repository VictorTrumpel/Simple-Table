import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class TableWasAddedDto {
  @IsNumber()
  @IsNotEmpty()
  userId!: number;

  @IsString()
  @IsNotEmpty()
  tableId!: string;
}

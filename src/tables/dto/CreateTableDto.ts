import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTableDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsNumber()
  databaseId!: number;
}

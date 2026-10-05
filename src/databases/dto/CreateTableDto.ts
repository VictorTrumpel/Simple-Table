import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTableDto {
  @IsNotEmpty()
  @IsString()
  name!: string;
}

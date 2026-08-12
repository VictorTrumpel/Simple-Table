import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDatabaseDto {
  @IsNotEmpty()
  @IsString()
  name!: string;
}

import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTableFormDataDto {
  @IsString()
  @IsNotEmpty()
  databaseId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;
}

import { IsDefined, IsNotEmpty, IsObject, IsString } from 'class-validator';

export class AddRowDto {
  @IsString()
  @IsNotEmpty()
  tableId!: string;

  @IsDefined()
  @IsObject()
  data!: Record<string, unknown>;
}

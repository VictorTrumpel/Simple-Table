import { IsDefined, IsNotEmpty, IsObject, IsString } from 'class-validator';

type ColId = string;
type ColData = unknown;

export class AddRowDto {
  @IsString()
  @IsNotEmpty()
  tableId!: string;

  @IsDefined()
  @IsObject()
  data!: Record<ColId, ColData>;
}

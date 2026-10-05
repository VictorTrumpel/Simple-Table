import { IsDefined, IsObject } from 'class-validator';

type ColId = string;
type ColData = unknown;

export class AddRowDto {
  @IsDefined()
  @IsObject()
  data!: Record<ColId, ColData>;
}

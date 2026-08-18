import { ArrayNotEmpty, IsArray, IsDefined, IsString } from 'class-validator';

export class DeleteRowsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsDefined()
  @IsString({ each: true })
  rowIds!: string[];
}

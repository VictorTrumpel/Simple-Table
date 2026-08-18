import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsDefined,
  IsNumberString,
  IsString,
} from 'class-validator';

export class DeleteRowsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsDefined()
  @IsString({ each: true })
  @ArrayMaxSize(500)
  @IsNumberString({}, { each: true })
  rowIds!: string[];
}

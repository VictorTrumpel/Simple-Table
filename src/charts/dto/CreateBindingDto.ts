import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateBindingDto {
  @IsString()
  @IsNotEmpty()
  tableId!: string;

  @IsString()
  @IsNotEmpty()
  columnId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  bindingKey!: string;
}

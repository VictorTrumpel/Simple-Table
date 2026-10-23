import { IsDefined, IsObject } from 'class-validator';

export class UpdateConfigDto {
  @IsDefined()
  @IsObject()
  config!: Record<string, unknown>;
}

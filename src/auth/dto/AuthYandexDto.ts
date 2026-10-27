import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AuthYandexDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(8192)
  accessToken!: string;
}

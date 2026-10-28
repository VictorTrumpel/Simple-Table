import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AuthGithubDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  code!: string;
}

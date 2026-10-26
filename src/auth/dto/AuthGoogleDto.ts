import { IsString, IsNotEmpty } from 'class-validator';

export class AuthGoogleDto {
  @IsString()
  @IsNotEmpty()
  googleCredential!: string;
}

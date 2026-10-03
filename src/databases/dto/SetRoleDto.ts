import { IsNotEmpty, IsNumber, IsString, IsIn } from 'class-validator';

export class SetRoleDto {
  @IsNotEmpty()
  @IsNumber()
  userId!: number;

  @IsNotEmpty()
  @IsString()
  @IsIn(['writer', 'admin', 'reader'])
  role!: string;
}

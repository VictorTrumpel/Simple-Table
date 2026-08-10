import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/LoginDto';
import { CreateUserDTO } from './dto/CreateUserDto';
import { Public } from './decorators/Public';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.loginUser(loginDto);
  }

  @Public()
  @Post('/register')
  register(@Body() registerDto: CreateUserDTO) {
    return this.authService.register(registerDto);
  }
}

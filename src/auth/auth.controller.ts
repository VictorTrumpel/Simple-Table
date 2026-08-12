import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/LoginDto';
import { CreateUserDTO } from './dto/CreateUserDto';
import { Public } from './decorators/Public';
import { CurrentUserId } from './decorators/CurrentUserId';

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

  @Get('/info')
  info(@CurrentUserId() userId: number) {
    return this.authService.getUserById(userId);
  }
}

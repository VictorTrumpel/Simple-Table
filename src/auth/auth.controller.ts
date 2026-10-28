import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/LoginDto';
import { CreateUserDTO } from './dto/CreateUserDto';
import { Public } from './decorators/Public';
import { CurrentUserId } from './decorators/CurrentUserId';
import { AuthGoogleDto } from './dto/AuthGoogleDto';
import { AuthYandexDto } from './dto/AuthYandexDto';
import { AuthGithubDto } from './dto/AuthGithubDto';

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

  @Post('/google/login')
  @Public()
  async authGoogle(@Body() authGoogleDto: AuthGoogleDto) {
    return this.authService.loginGoogleUser(authGoogleDto.googleCredential);
  }

  @Public()
  @Post('/yandex/login')
  authYandex(@Body() authYandexDto: AuthYandexDto) {
    return this.authService.loginYandexUser(authYandexDto.accessToken);
  }

  @Public()
  @Post('/github/login')
  authGithub(@Body() authGithubDto: AuthGithubDto) {
    return this.authService.loginGithubUser(authGithubDto.code);
  }
}

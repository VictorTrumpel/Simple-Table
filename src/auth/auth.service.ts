import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/LoginDto';
import { CreateUserDTO } from './dto/CreateUserDto';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import argon2 from 'argon2';

type UserEntity = {
  id: number;
  email: string;
  name: string;
  passwordHash: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async loginUser(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();

    const loginFailError = new UnauthorizedException(
      'Неверный логин или пароль',
    );

    if (!user) {
      throw loginFailError;
    }

    const isValidPassword = await argon2.verify(user.passwordHash, password);

    if (!isValidPassword) {
      throw loginFailError;
    }

    const accessToken = await this.jwtService.signAsync({
      userId: user.id,
    });

    return {
      token: accessToken,
      userInfo: { email: user.email, name: user.name },
    };
  }

  async register(createDto: CreateUserDTO) {
    const existingUser = await this.userRepository.findOneBy({
      email: createDto.email,
    });

    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const { email, name, password } = createDto;

    const passwordHash = await argon2.hash(password);

    const user = this.userRepository.create({
      email,
      name,
      passwordHash,
    });

    await this.userRepository.save(user);

    return await this.loginUser({ email, password });
  }
}

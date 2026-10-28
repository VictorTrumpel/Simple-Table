import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/LoginDto';
import { CreateUserDTO } from './dto/CreateUserDto';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { OAuth2Client } from 'google-auth-library';
import argon2 from 'argon2';
import { randomBytes } from 'node:crypto';
import { YandexIdService } from './yandexid.service';
import { GithubService } from './github.service';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly yandexIdService: YandexIdService,
    private readonly githubService: GithubService,
  ) {
    this.googleClient = new OAuth2Client();
  }

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

  async getUserById(userId: number) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException({
        message: `Unknown user with id: ${userId}`,
      });
    }

    return this.userRepository.findOneBy({ id: userId });
  }

  async loginYandexUser(yandexAccessToken: string) {
    const profile = await this.yandexIdService.getProfile(yandexAccessToken);

    const possibleUser = await this.userRepository.findOneBy({
      yandexId: profile.id,
    });

    if (!possibleUser) {
      const existingUser = await this.userRepository.findOneBy({
        email: profile.email,
      });

      if (existingUser) {
        throw new ConflictException({ message: 'This user has already exist' });
      }

      const newUser = this.userRepository.create({
        yandexId: profile.id,
        email: profile.email,
        name: profile.name,
        passwordHash: await argon2.hash(randomBytes(32)),
      });

      await this.userRepository.save(newUser);

      return {
        token: await this.jwtService.signAsync({ userId: newUser.id }),
        userInfo: {
          email: newUser.email,
          name: newUser.name,
          avatarUrl: profile.avatarUrl,
          createdAt: newUser.createdAt,
        },
      };
    }

    return {
      token: await this.jwtService.signAsync({ userId: possibleUser.id }),
      userInfo: {
        email: possibleUser.email,
        name: possibleUser.name,
        avatarUrl: profile.avatarUrl,
        createdAt: possibleUser.createdAt,
      },
    };
  }

  async loginGithubUser(code: string) {
    const accessToken = await this.githubService.getAccessToken(code);

    const existingUser = await this.userRepository.findOneBy({
      githubToken: accessToken,
    });

    if (existingUser) {
      return this.buildGithubLoginResponse(existingUser);
    }

    const profile = await this.githubService.getProfile(accessToken);

    const userWithSameEmail = await this.userRepository.findOneBy({
      email: profile.email,
    });

    if (userWithSameEmail) {
      await this.userRepository.update(userWithSameEmail.id, {
        githubToken: accessToken,
      });

      return this.buildGithubLoginResponse(userWithSameEmail);
    }

    const newUser = this.userRepository.create({
      githubToken: accessToken,
      email: profile.email,
      name: profile.name,
      passwordHash: await argon2.hash(randomBytes(32)),
    });

    await this.userRepository.save(newUser);

    return this.buildGithubLoginResponse(newUser);
  }

  private async buildGithubLoginResponse(user: User) {
    return {
      token: await this.jwtService.signAsync({ userId: user.id }),
      userInfo: {
        email: user.email,
        name: user.name,
        avatarUrl: '',
        createdAt: user.createdAt,
      },
    };
  }

  async loginGoogleUser(googleCred: string) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken: googleCred,
      audience: process.env.CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email || !payload.email_verified) {
      throw new UnauthorizedException({ message: 'Google email not found' });
    }

    const user = await this.userRepository.findOne({
      where: { googleSub: payload.sub },
    });

    if (user) {
      const accessToken = await this.jwtService.signAsync({
        userId: user.id,
      });

      return {
        token: accessToken,
        userInfo: {
          email: user.email,
          name: user.name,
          avatarUrl: payload.picture,
        },
      };
    }

    const newUser = this.userRepository.create({
      name: payload.name,
      passwordHash: 'empty',
      email: payload.email,
      googleSub: payload.sub,
    });

    await this.userRepository.save(newUser);

    const accessToken = await this.jwtService.signAsync({
      userId: newUser.id,
    });

    return {
      token: accessToken,
      userInfo: {
        email: newUser.email,
        name: newUser.name,
        avatarUrl: payload.picture,
      },
    };
  }
}

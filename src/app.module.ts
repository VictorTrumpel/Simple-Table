import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DatabasesModule } from './databases/databases.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TablesModule } from './tables/tables.module';
import { ChangelogModule } from './changelog/changelog.module';
import { UsersModule } from './users/users.module';
import { ChartsModule } from './charts/charts.module';
import { HealthcheckModule } from './healthcheck/healthcheck.module';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionLoggingFilter } from './logging/http-exception-logging.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('POSTGRES_HOST'),
        port: configService.getOrThrow<number>('POSTGRES_PORT'),
        username: configService.getOrThrow<string>('POSTGRES_USER'),
        password: configService.getOrThrow<string>('POSTGRES_PASSWORD'),
        database: configService.getOrThrow<string>('POSTGRES_DB'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),

    AuthModule,
    DatabasesModule,
    TablesModule,
    ChangelogModule,
    UsersModule,
    ChartsModule,
    HealthcheckModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionLoggingFilter,
    },
  ],
})
export class AppModule {}

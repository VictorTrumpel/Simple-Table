import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { NextFunction, Request } from 'express';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useLogger(['log', 'error', 'warn', 'debug', 'verbose']);

  const logger = new Logger('HTTP');

  app.use((req: Request, _: unknown, next: NextFunction) => {
    logger.log(`${req.method} ${req.originalUrl}`);
    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch(console.error);

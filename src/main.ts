import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { WsAdapter } from '@nestjs/platform-ws';
import { httpLoggingMiddleware } from './logging/http-logging.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useLogger(['log', 'error', 'warn', 'debug', 'verbose']);
  app.use(httpLoggingMiddleware);

  app.enableCors({
    origin: 'https://app.simple-table.tech',
    exposedHeaders: ['X-Request-Id'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.useWebSocketAdapter(new WsAdapter(app));

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((error: unknown) => {
  new Logger('Bootstrap').error(
    'Application bootstrap failed',
    error instanceof Error ? error.stack : String(error),
  );
  process.exitCode = 1;
});

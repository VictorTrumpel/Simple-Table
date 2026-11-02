import { Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { NextFunction, Request, Response } from 'express';

const logger = new Logger('HTTP');

export function httpLoggingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const startedAt = performance.now();
  const requestId = randomUUID();
  const context = { requestId, method: req.method, path: req.path };

  res.setHeader('X-Request-Id', requestId);
  logger.log({ event: 'request_started', ...context });

  const logResult = (aborted: boolean): void => {
    res.off('finish', onFinish);
    res.off('close', onClose);

    const message = {
      event: aborted ? 'request_aborted' : 'request_completed',
      ...context,
      statusCode: res.headersSent ? res.statusCode : undefined,
      durationMs: Number((performance.now() - startedAt).toFixed(1)),
    };

    if (!aborted && res.statusCode >= 500) {
      logger.error(message);
    } else if (aborted || res.statusCode >= 400) {
      logger.warn(message);
    } else {
      logger.log(message);
    }
  };

  const onFinish = (): void => logResult(false);
  const onClose = (): void => logResult(!res.writableFinished);

  res.once('finish', onFinish);
  res.once('close', onClose);
  next();
}

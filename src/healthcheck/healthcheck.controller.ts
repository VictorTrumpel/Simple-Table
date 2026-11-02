import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorators/Public';

@Controller('healthcheck')
export class HealthcheckController {
  @Public()
  @Get()
  check() {
    return { status: 'ok' };
  }
}

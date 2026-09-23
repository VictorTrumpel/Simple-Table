import { Controller, Get, Param } from '@nestjs/common';
import { ChangelogService } from './changelog.service';

@Controller('changelog')
export class ChangelogController {
  constructor(private readonly changelogService: ChangelogService) {}

  @Get('table/:tableId')
  getTableChanges(@Param('tableId') tableId: string) {
    return this.changelogService.getTableChangeList(tableId);
  }
}

import { Controller, Get, Post, Body } from '@nestjs/common';
import { DatabasesService } from './databases.service';
import { CurrentUserId } from 'src/auth/decorators/CurrentUserId';
import { CreateDatabaseDto } from './dto/CreateDatabaseDto';

@Controller('databases')
export class DatabasesController {
  constructor(private readonly databasesService: DatabasesService) {}

  @Get('/list')
  getList(@CurrentUserId() userId: number) {
    return this.databasesService.getDatabaseListOfUser(userId);
  }

  @Post('/create')
  create(
    @Body() createDatabaseDto: CreateDatabaseDto,
    @CurrentUserId() userId: number,
  ) {
    return this.databasesService.create(createDatabaseDto, userId);
  }

  @Get('/:id/users')
  getUsersOfDatabase() {
    return [];
  }

  @Get('/:id/role')
  getRoleOfDatabase() {
    return { role: 'admin' };
  }
}

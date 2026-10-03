import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { DatabasesService } from './databases.service';
import { CurrentUserId } from 'src/auth/decorators/CurrentUserId';
import { CreateDatabaseDto } from './dto/CreateDatabaseDto';
import { SetRoleDto } from './dto/SetRoleDto';

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
  getUsersOfDatabase(@Param('id') dbId: number) {
    return this.databasesService.getUsersOfDatabase(dbId);
  }

  @Get('/:id/role')
  getRoleOfDatabase(
    @CurrentUserId() userId: number,
    @Param('id') dbId: number,
  ) {
    return this.databasesService.getRoleInDatabase(userId, dbId);
  }

  @Post('/:id/set-role')
  setRole(
    @Body() setRoleDto: SetRoleDto,
    @Param('id') dbId: number,
    @CurrentUserId() userId: number,
  ) {
    return this.databasesService.setRoleInDb(userId, dbId, setRoleDto);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { DatabasesService } from './databases.service';
import { CurrentUserId } from 'src/auth/decorators/CurrentUserId';
import { CreateDatabaseDto } from './dto/CreateDatabaseDto';
import { SetRoleDto } from './dto/SetRoleDto';
import { CreateTableDto } from './dto/CreateTableDto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateChartDto } from './dto/CreateChartDto';

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
  async getUsersOfDatabase(
    @Param('id') dbId: number,
    @CurrentUserId() userId: number,
  ) {
    await this.databasesService.getRoleInDatabase(userId, dbId);
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

  @Post('/:id/add-table')
  addTable(
    @Body() createTableDto: CreateTableDto,
    @CurrentUserId() userId: number,
    @Param('id') dbId: number,
  ) {
    return this.databasesService.addTable(userId, dbId, createTableDto.name);
  }

  @Post('/:id/add-chart')
  addGraphics(
    @Body() createChartDto: CreateChartDto,
    @CurrentUserId() userId: number,
    @Param('id') dbId: number,
  ) {
    return this.databasesService.createChart(createChartDto, userId, dbId);
  }

  @Post('/:id/import')
  @UseInterceptors(FileInterceptor('file'))
  importTableByExcel(
    @UploadedFile() file: Express.Multer.File,
    @Body() importTableDto: CreateTableDto,
    @Param('id') dbId: number,
    @CurrentUserId() userId: number,
  ) {
    return this.databasesService.importTableFromExcel(
      userId,
      dbId,
      importTableDto.name,
      file,
    );
  }

  @Get('/:id/tables')
  getTables(@Param('id') dbId: number) {
    return this.databasesService.getTables(dbId);
  }
}

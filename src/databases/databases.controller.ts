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

  @Post('/:id/add-table')
  addTable(
    @Body() createTableDto: CreateTableDto,
    @CurrentUserId() userId: number,
    @Param('id') dbId: number,
  ) {
    return this.databasesService.addTable(userId, dbId, createTableDto.name);
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
}

import { Module } from '@nestjs/common';
import { DatabasesController } from './databases.controller';
import { DatabasesService } from './databases.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Database } from './entities/database.entity';
import { UsersDatabases } from './entities/usersDatabases.entity';
import { Table } from 'src/tables/entities/table.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Database, UsersDatabases, Table, User])],
  controllers: [DatabasesController],
  providers: [DatabasesService],
})
export class DatabasesModule {}

import { Module } from '@nestjs/common';
import { DatabasesController } from './databases.controller';
import { DatabasesService } from './databases.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Database } from './entities/database.entity';
import { UsersDatabases } from './entities/usersDatabases.entity';
import { Table } from 'src/tables/entities/table.entity';
import { User } from 'src/users/entities/user.entity';
import { TablesModule } from 'src/tables/tables.module';
import { ChangelogModule } from 'src/changelog/changelog.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Database, UsersDatabases, Table, User]),
    TablesModule,
    ChangelogModule,
  ],
  controllers: [DatabasesController],
  providers: [DatabasesService],
})
export class DatabasesModule {}

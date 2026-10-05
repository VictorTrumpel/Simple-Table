import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  NotFoundException,
  Injectable,
} from '@nestjs/common';
import { AuthenticatedRequest } from 'src/auth/guards/AuthGuard';
import { Repository } from 'typeorm';
import { Table } from '../entities/table.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersDatabases } from 'src/databases/entities/usersDatabases.entity';

@Injectable()
export class TableGuard implements CanActivate {
  constructor(
    @InjectRepository(Table) private tableRepository: Repository<Table>,
    @InjectRepository(UsersDatabases)
    private dbRepository: Repository<UsersDatabases>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.getArgByIndex<AuthenticatedRequest>(0);

    const userId = request.authGuard.userId;
    const tableId = request.params.tableId;

    if (!userId)
      throw new UnauthorizedException({ message: 'Unauthorized user' });

    if (!tableId) throw new NotFoundException({ message: 'Not found table' });

    const tableMeta = await this.tableRepository.findOneBy({
      id: String(tableId),
    });

    if (!tableMeta)
      throw new NotFoundException({
        message: `Not found table with id: ${String(tableId)}`,
      });

    const dbId = tableMeta.databaseId;

    const userRoleInDatabase = await this.dbRepository.findOneBy({
      databaseId: dbId,
      userId: userId,
    });

    if (!userRoleInDatabase)
      throw new NotFoundException({
        message: `Not found user role in database with id: ${String(dbId)}`,
      });

    if (userRoleInDatabase.role === 'reader' && request.method === 'GET')
      return true;

    if (
      userRoleInDatabase.role === 'admin' ||
      userRoleInDatabase.role === 'writer'
    )
      return true;

    return false;
  }
}

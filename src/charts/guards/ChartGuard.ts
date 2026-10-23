import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChartEntity } from '../entities/chart.entity';
import { AuthenticatedRequest } from 'src/auth/guards/AuthGuard';
import { UsersDatabases } from 'src/databases/entities/usersDatabases.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ChartGuard implements CanActivate {
  constructor(
    @InjectRepository(ChartEntity)
    private chartRepository: Repository<ChartEntity>,
    @InjectRepository(UsersDatabases)
    private dbRepository: Repository<UsersDatabases>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.getArgByIndex<AuthenticatedRequest>(0);

    const userId = request.authGuard.userId;
    const chartId = request.params.id;

    if (!userId) {
      throw new UnauthorizedException({ message: 'Unauthorized user' });
    }

    if (!chartId) {
      throw new NotFoundException({ message: 'Not found table' });
    }

    const chartMeta = await this.chartRepository.findOneBy({
      id: Number(chartId),
    });

    if (!chartMeta)
      throw new NotFoundException({
        message: `Not found table with id: ${Number(chartId)}`,
      });

    const dbId = chartMeta.databaseId;

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

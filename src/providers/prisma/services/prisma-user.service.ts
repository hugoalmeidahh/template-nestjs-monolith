import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  Prisma,
  PrismaClient,
  User,
} from '../../../../prisma-user/generated/prisma/client';

@Injectable()
export class PrismaUserService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaUserService.name);

  constructor(private config: ConfigService) {
    const connectionString = config.get<string>('DATABASE_USER_URI');

    if (!connectionString) {
      throw new Error('Missing DATABASE_USER_URI environment variable');
    }

    super({
      adapter: new PrismaPg({ connectionString }),
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
      ],
    });

    this.$on('query' as never, (e: Prisma.QueryEvent) => {
      this.logger.debug('Query: ' + e.query);
      this.logger.debug('Params: ' + e.params);
      this.logger.debug('Duration: ' + e.duration + 'ms');
    });

    this.$on('error' as never, (e: Prisma.LogEvent) => {
      if (
        this.config.get('NODE_ENV') === 'testing' &&
        e?.message?.indexOf('ProcessInterrupts') > -1
      ) {
        return;
      }
      this.logger.error('Prisma User Error: ' + e.message);
    });

    this.$on('info' as never, (e: Prisma.LogEvent) => {
      this.logger.log('Prisma User Info: ' + e.message);
    });

    this.$on('warn' as never, (e: Prisma.LogEvent) => {
      this.logger.warn('Prisma User Warning: ' + e.message);
    });
  }

  getAllUsers(): Promise<User[]> {
    return this.user.findMany({
      orderBy: {
        id: 'asc',
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }
}

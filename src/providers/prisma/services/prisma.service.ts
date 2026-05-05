import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  Prisma,
  PrismaClient,
} from '../../../../prisma/generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);
  constructor(private config: ConfigService) {
    const connectionString = config.get<string>('DATABASE_URI');

    if (!connectionString) {
      throw new Error('Missing DATABASE_URI environment variable');
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
      this.logger.error('Prisma Error: ' + e.message);
    });

    this.$on('info' as never, (e: Prisma.LogEvent) => {
      this.logger.log('Prisma Info: ' + e.message);
    });

    this.$on('warn' as never, (e: Prisma.LogEvent) => {
      this.logger.warn('Prisma Warning: ' + e.message);
    });
  }

  async onModuleInit() {
    await this.$connect();
  }
}

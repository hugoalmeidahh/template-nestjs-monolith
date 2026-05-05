import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';
import { Request } from 'express';
import { LoggerModule } from 'nestjs-pino';
import { v4 as uuidv4 } from 'uuid';
import { AppBasicStrategy } from './app-basic.strategy';
import { ActionLogModule } from './modules/action-log/action-log.module';
import { ActionLogService } from './modules/action-log/services/action-log.service';
import { OrganizationModule } from './modules/organization/organization.module';
import { UserModule } from './modules/user/user.module';
import { AmqplibModule } from './providers/amqplib/amqplib.module';
import { AwsModule } from './providers/aws/aws.module';
import { PrismaModule } from './providers/prisma/prisma.module';

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService, ActionLogService],
      imports: [ActionLogModule],
      useFactory: (config: ConfigService, actionLog: ActionLogService) => {
        const env = config.get<string>('NODE_ENV', 'local');
        return {
          pinoHttp: {
            level: config.get('LOG_LEVEL', 'debug'),
            transport: env === 'local' ? { target: 'pino-pretty' } : undefined,
            genReqId: (request: Request) =>
              request.headers['x-request-id'] || uuidv4(),
            serializers: {
              req(value: any) {
                return actionLog.pinoRequestIntercept(value);
              },
              res(value: any) {
                return actionLog.pinoRequestResponseIntercept(value);
              },
            },
          },
        };
      },
    }),
    ActionLogModule,
    AmqplibModule,
    AwsModule,
    PrismaModule,
    OrganizationModule,
    UserModule,
  ],
  providers: [
    AppBasicStrategy,
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
  ],
})
export class AppModule {}

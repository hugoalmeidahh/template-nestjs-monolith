import { Module } from '@nestjs/common';
import { PrismaModule } from '../../providers/prisma/prisma.module';
import { ActionLogService } from './services/action-log.service';

@Module({
  imports: [PrismaModule],
  providers: [ActionLogService],
  exports: [ActionLogService],
})
export class ActionLogModule {}

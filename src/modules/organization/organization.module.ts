import { Module } from '@nestjs/common';
import { PrismaModule } from '../../providers/prisma/prisma.module';
import { ActionLogModule } from '../action-log/action-log.module';
import { OrganizationController } from './controllers/organization.controller';
import { OrganizationService } from './services/organization.service';

@Module({
  imports: [PrismaModule, ActionLogModule],
  controllers: [OrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}

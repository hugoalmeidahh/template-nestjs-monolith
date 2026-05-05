import { Module } from '@nestjs/common';
import { PrismaUserService } from './services/prisma-user.service';
import { PrismaService } from './services/prisma.service';

@Module({
  providers: [PrismaService, PrismaUserService],
  exports: [PrismaService, PrismaUserService],
})
export class PrismaModule {}

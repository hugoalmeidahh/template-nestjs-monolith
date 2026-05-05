import { Injectable } from '@nestjs/common';
import { PrismaUserService } from '../../../providers/prisma/services/prisma-user.service';

@Injectable()
export class UserService {
  constructor(private readonly prismaUser: PrismaUserService) {}

  getAll() {
    return this.prismaUser.getAllUsers();
  }
}

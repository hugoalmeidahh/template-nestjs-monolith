import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBasicAuth, ApiOkResponse } from '@nestjs/swagger';
import { UserOutput } from '../dtos/user.output';
import { UserService } from '../services/user.service';

@ApiBasicAuth()
@UseGuards(AuthGuard('basic'))
@Controller('users')
export class UserController {
  constructor(private service: UserService) {}

  @Get()
  @ApiOkResponse({ type: [UserOutput] })
  async getAll() {
    const result = await this.service.getAll();

    return result.map((item) => UserOutput.getInstance(item));
  }
}

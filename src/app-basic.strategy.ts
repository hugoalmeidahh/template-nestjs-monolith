import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { BasicStrategy as Strategy } from 'passport-http';

@Injectable()
export class AppBasicStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      passReqToCallback: true,
    });
  }

  public validate = (
    req: Request,
    username: string,
    password: string,
  ): boolean => {
    if (
      this.configService.getOrThrow<string>('BASIC_USER') === username &&
      this.configService.getOrThrow<string>('BASIC_PASS') === password
    ) {
      return true;
    }
    throw new UnauthorizedException();
  };
}

import { HttpStatus } from '@nestjs/common';
import { BaseError } from './base.error';

export class NotStrongPasswordError extends BaseError {
  public httpCode = HttpStatus.BAD_REQUEST;
  public message: string;

  constructor(message: string) {
    const fullMessage = `Not secure password: ${message}`;

    super(fullMessage);

    this.message = fullMessage;
  }
}

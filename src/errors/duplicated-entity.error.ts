import { HttpStatus } from '@nestjs/common';
import { BaseError } from './base.error';

export class DuplicatedEntityError extends BaseError {
  public httpCode = HttpStatus.CONFLICT;
  public message: string;

  constructor(message: string) {
    super(message);

    this.message = message;
  }
}

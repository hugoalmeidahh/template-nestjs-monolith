import { HttpStatus } from '@nestjs/common';
import { BaseError } from './base.error';

export class EntityNotFoundError extends BaseError {
  public httpCode = HttpStatus.NOT_FOUND;
  public message: string;

  constructor(entityName: string) {
    const message = `${entityName} not found`;

    super(message);

    this.message = message;
  }
}

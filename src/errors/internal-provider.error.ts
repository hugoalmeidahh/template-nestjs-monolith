import { HttpStatus } from '@nestjs/common';
import { BaseError } from './base.error';

export class InternalProviderError extends BaseError {
  public httpCode = HttpStatus.INTERNAL_SERVER_ERROR;
  public message: string;
  public context: any;

  constructor(reason: string, providerName: string, context?: any) {
    const message = `${providerName} provider error: ${reason}`;

    super(message);

    this.message = message;
    this.context = context;

    console.error(context);
  }
}

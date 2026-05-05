import { HttpStatus } from '@nestjs/common';
import Joi from 'joi';
import { BaseError } from './base.error';

export class InvalidEnvironmentError extends BaseError {
  public httpCode = HttpStatus.SERVICE_UNAVAILABLE;
  public message: string;

  constructor(errorData: Joi.ValidationError | undefined) {
    let message = 'Environment variables validation failed.';

    if (errorData?.details) {
      message += '\n\nConfig validation error(s):\n';
      errorData.details.map((item) => {
        message += `\n - ${item.message}.`;
      });
    }

    super(message);

    this.message = message;
  }
}

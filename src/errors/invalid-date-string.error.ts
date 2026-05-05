import { HttpStatus } from '@nestjs/common';
import { BaseError } from './base.error';

export class InvalidDateStringError extends BaseError {
  public httpCode = HttpStatus.BAD_REQUEST;
  public message: string;

  constructor(
    validFormat?: string,
    invalidString?: string,
    fieldName?: string,
  ) {
    let message = 'Invalid date format.\n';

    if (validFormat) {
      message += `\nExpected format: ${validFormat}.`;
    }

    if (invalidString) {
      message += `\nReceived string: ${invalidString}.`;
    }

    if (fieldName) {
      message += `\nField name: ${fieldName}.`;
    }

    super(message);

    this.message = message;
  }
}

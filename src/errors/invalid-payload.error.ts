import { HttpStatus } from '@nestjs/common';
import { BaseError } from './base.error';

export class InvalidPayloadError extends BaseError {
  public httpCode = HttpStatus.BAD_REQUEST;
  public message: string;
  public details?: Record<string, string>;

  constructor(
    invalidFields: string[] = [],
    context?: string,
    errorDetails?: Record<string, string>,
  ) {
    let message = `Invalid payload, please check ${context ?? ''} `;

    if (invalidFields.length) {
      message += `\`${invalidFields.join('`, `')}\``;
    }

    message += ` field${invalidFields.length > 1 ? 's' : ''}.`;

    if (errorDetails && Object.keys(errorDetails).length) {
      message += '\n';

      Object.keys(errorDetails)
        .filter((key) => errorDetails[key])
        .forEach((item) => {
          message += `\n\`${item}\`: ${errorDetails[item]}`;
        });

      message += '.';
    }

    super(message);

    this.message = message;
    this.details = errorDetails;
  }
}

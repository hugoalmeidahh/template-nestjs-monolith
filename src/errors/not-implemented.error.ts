import { HttpStatus } from '@nestjs/common';
import { BaseError } from './base.error';

export class NotImplementedError extends BaseError {
  public httpCode = HttpStatus.NOT_IMPLEMENTED;
  public message: string;
  public module: string;

  constructor(feature: string, module: string) {
    const message = `the feature ${feature} of ${module} is not implemented yet`;

    super(message);

    this.message = message;
    this.module = module;
  }
}

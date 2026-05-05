import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import * as PasswordValidator from 'password-validator';
import { NotStrongPasswordError } from '../errors/not-strong-password.error';

export class PasswordValidatorHelper {
  private schema: PasswordValidator;
  private blacklist = ['password', 'senha'];
  constructor(
    settings = {
      min: 12,
      max: 30,
      withUppercase: true,
      withLowercase: true,
      minDigits: 1,
      withoutSpaces: false,
    },
  ) {
    this.schema = new PasswordValidator();
    this.schema
      .is()
      .min(settings.min)
      .max(settings.max)
      .has()
      .digits(settings.minDigits)
      .is()
      .not()
      .oneOf(this.blacklist);

    if (settings.withLowercase) {
      this.schema.has().lowercase();
    }

    if (settings.withUppercase) {
      this.schema.has().uppercase();
    }

    if (settings.withoutSpaces) {
      this.schema.has().not().spaces();
    }
  }

  handle(password: string) {
    const validation = this.schema.validate(password, {
      details: true,
    }) as { message: string }[];

    if (!validation.length) {
      return true;
    }

    const errors = validation.map(({ message }) => message).join(', ');
    throw new NotStrongPasswordError(errors);
  }
}

@ValidatorConstraint()
export class StrongPassword implements ValidatorConstraintInterface {
  validate(
    value: string,
    validationArguments?: ValidationArguments,
  ): Promise<boolean> | boolean {
    if (value) {
      try {
        return new PasswordValidatorHelper().handle(value);
      } catch (e) {
        if (!validationArguments?.constraints?.includes('optional')) {
          throw e;
        }
      }
    }

    return false;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `${validationArguments?.property} field needs a strong password`;
  }
}

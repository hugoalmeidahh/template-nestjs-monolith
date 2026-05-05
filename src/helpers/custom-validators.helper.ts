import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint()
export class CustomIsPhoneNumber implements ValidatorConstraintInterface {
  validate(value: string): Promise<boolean> | boolean {
    if (!value) {
      return false;
    }
    const phoneRegex = /^\+\d{6,14}$/;
    return phoneRegex.test(value);
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `${validationArguments?.property} field needs a valid phone number`;
  }
}

@ValidatorConstraint()
export class CustomIsName implements ValidatorConstraintInterface {
  validate(value: string): Promise<boolean> | boolean {
    return value.length >= 5 && value.split(' ').length >= 2;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `${validationArguments?.property} field needs a valid person name`;
  }
}

@ValidatorConstraint()
export class CustomIsUrl implements ValidatorConstraintInterface {
  validate(value: string): Promise<boolean> | boolean {
    if (!value) {
      return false;
    }

    try {
      const url = new URL(value);
      return (
        (url.protocol === 'http:' || url.protocol === 'https:') &&
        !!url.hostname
      );
    } catch {
      return false;
    }
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `${validationArguments?.property} must be a valid URL address`;
  }
}

@ValidatorConstraint()
export class CustomIsFileName implements ValidatorConstraintInterface {
  validate(value: string): Promise<boolean> | boolean {
    if (!value) {
      return false;
    }
    const filenameRegex = /^[\w,\s-]+\.[A-Za-z]{3}$/;
    return filenameRegex.test(value);
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `${validationArguments?.property} field needs a valid file name`;
  }
}

@ValidatorConstraint()
export class CustomIsDecimalString implements ValidatorConstraintInterface {
  validate(value: string): Promise<boolean> | boolean {
    if (!value) {
      return false;
    }
    const valueRegex = /^\d+\.\d{2}$/;
    return valueRegex.test(value);
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `${validationArguments?.property} field needs a valid decimal string with 2 decimals places. ex: 10.00`;
  }
}

export const checkIp = (ip: string) => {
  return /^((1?\d{1,2}|2([0-4]\d|5[0-5]))\.){3}(1?\d{1,2}|2([0-4]\d|5[0-5]))$|^$/.test(
    ip,
  );
};

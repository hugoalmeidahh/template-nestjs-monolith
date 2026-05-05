import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { InvalidPayloadError } from '../errors/invalid-payload.error';

export const ValidatorHelper = async <
  J extends object,
  T extends ClassConstructor<J>,
>(
  obj: T,
  plain: J,
) => {
  const instance = plainToInstance(obj, plain);
  const errors = await validate(instance);

  if (errors.length > 0) {
    throw new InvalidPayloadError(
      errors.map(({ property }) => property),
      obj.name,
      errors.reduce((result, item) => {
        return {
          ...result,
          [item.property]: Object.values(item.constraints ?? {}).join(', '),
        };
      }, {}),
    );
  }

  return instance;
};

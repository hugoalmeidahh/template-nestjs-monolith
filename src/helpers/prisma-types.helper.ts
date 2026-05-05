import Big from 'big.js';
import { Prisma } from '../../prisma/generated/prisma/client';

export const decimalEntriesToString = <T>(data: T): T => {
  if (!data) {
    return data;
  }

  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      const isDecimal = value instanceof Prisma.Decimal;
      const isBigInt = value?.constructor?.name === 'BigInt';

      let finalValue = value;

      if (isDecimal) {
        finalValue = new Big(value.toString()).toString();
      }

      if (isBigInt) {
        finalValue = Number((value as any).toString());
      }

      return [key, finalValue];
    }),
  ) as T;
};

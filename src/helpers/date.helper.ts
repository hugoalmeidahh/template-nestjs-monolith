import { DateTime } from 'luxon';
import { InvalidDateStringError } from '../errors/invalid-date-string.error';

export const dateTimeStringToJs = (
  date: string | Date,
  defaultTime = '00:00:00',
) => {
  if (date instanceof Date) {
    return date;
  }

  let dateObj = DateTime.fromISO(date);
  const dateTime = date.trim().split(/\s|T/);

  if (dateTime.length === 1) {
    dateObj = DateTime.fromISO(`${dateTime[0]}T${defaultTime}`);
  }

  if (!dateObj.isValid) {
    throw new InvalidDateStringError('YYYY-MM-DDTHH:MM:SS', date.toString());
  }

  return dateObj.toJSDate();
};

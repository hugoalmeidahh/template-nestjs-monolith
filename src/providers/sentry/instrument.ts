import * as Sentry from '@sentry/nestjs';

export const sentryInstrument = () => {
  const SENTRY_DSN = process.env.SENTRY_DSN;

  if (SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
    });
  }
};

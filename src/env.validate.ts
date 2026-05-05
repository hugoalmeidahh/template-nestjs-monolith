import { configDotenv } from 'dotenv';
import * as Joi from 'joi';
import { InvalidEnvironmentError } from './errors/invalid-environment.error';

export const envValidate = () => {
  configDotenv();

  const envSchema = Joi.object({
    NODE_ENV: Joi.string()
      .valid('local', 'staging', 'production', 'testing')
      .default('local'),
    APP_PORT: Joi.number().default(3777),
    APP_NAME: Joi.string().default('Template Api Monolith'),
    LOG_LEVEL: Joi.string().default('debug'),
    DATABASE_URI: Joi.string().uri().required(),
    DATABASE_USER_URI: Joi.string().uri().required(),
    SENTRY_DSN: Joi.string().uri().empty(''),
    BASIC_USER: Joi.string().required(),
    BASIC_PASS: Joi.string().required(),
    RABBITMQ_NOTIFICATION_URI: Joi.string().uri().required(),
    RABBITMQ_NOTIFICATION_QUEUE: Joi.string().required(),
    AWS_ENDPOINT_URL: Joi.string().uri().empty(''),
    AWS_ACCESS_KEY_ID: Joi.string().empty(''),
    AWS_SECRET_ACCESS_KEY: Joi.string().empty(''),
    AWS_SESSION_TOKEN: Joi.string().empty(''),
    AWS_REGION: Joi.string().required(),
    AWS_S3_BUCKET: Joi.string().empty(''),
    AWS_S3_URL_EXPIRES_IN_SECONDS: Joi.number().default(3600),
  }).unknown();

  const { error } = envSchema.validate(process.env, {
    abortEarly: false,
  });

  if (error) {
    throw new InvalidEnvironmentError(error);
  }
};

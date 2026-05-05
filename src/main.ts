import 'newrelic';
import { envValidate } from './env.validate';
import { sentryInstrument } from './providers/sentry/instrument';
import { secretsConfig } from './secrets.config';

import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { applyGlobalSettings } from './helpers/bootstrap.helper';
import { toSnakeCaseSchema } from './helpers/case.helpers';

async function bootstrap() {
  await secretsConfig();
  envValidate();
  sentryInstrument();

  const app = await NestFactory.create(AppModule);
  const logger = app.get(Logger);

  app.useLogger(logger);

  applyGlobalSettings(app);

  const config = app.get(ConfigService);
  const appName = config.get<string>('APP_NAME', 'Template Api Monolith');
  const port = Number(config.get('APP_PORT', 3000));

  const swaggerConfig = new DocumentBuilder()
    .setTitle(appName)
    .setDescription(`${appName} endpoints documentation`)
    .setVersion('1.0')
    .addBasicAuth()
    .build();

  const document = toSnakeCaseSchema(
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  SwaggerModule.setup('docs', app, () => document, {
    jsonDocumentUrl: '/docs-json',
  });

  await app.listen(port, () => {
    logger.log(`${appName} started at ${port} port.`);
  });
}

bootstrap();

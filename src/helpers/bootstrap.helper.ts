import { INestApplication, ValidationPipe } from '@nestjs/common';
import { GlobalErrorFilter } from '../errors/global.error-filter';
import { BodyQueryTransformPipe } from '../interceptors/body-query-transform.pipe';
import { ResponseTransformInterceptor } from '../interceptors/response-transform.interceptor';

export const applyGlobalSettings = (app: INestApplication<any>) => {
  app.enableCors({
    origin: '*',
  });
  app.useGlobalPipes(
    new BodyQueryTransformPipe(),
    new ValidationPipe({
      transform: true,
    }),
  );
  app.useGlobalFilters(new GlobalErrorFilter());
  app.useGlobalInterceptors(new ResponseTransformInterceptor());
};

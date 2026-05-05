import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { snakeKeys } from 'js-convert-case';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (Array.isArray(data)) {
          return data.map((subitem) =>
            snakeKeys(subitem, {
              recursive: true,
              recursiveInArray: true,
              keepTypesOnRecursion: [Date],
            }),
          );
        } else if (typeof data === 'object') {
          return snakeKeys(data, {
            recursive: true,
            recursiveInArray: true,
            keepTypesOnRecursion: [Date],
          });
        }
        return data;
      }),
    );
  }
}

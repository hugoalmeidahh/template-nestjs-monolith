import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { camelKeys } from 'js-convert-case';

@Injectable()
export class BodyQueryTransformPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (
      (metadata.type === 'query' || metadata.type === 'body') &&
      typeof value === 'object' &&
      value !== null
    ) {
      return camelKeys(value, {
        recursive: true,
        recursiveInArray: true,
      });
    }
    return value;
  }
}

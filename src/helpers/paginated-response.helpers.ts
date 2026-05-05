import { Type, applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiProperty,
  getSchemaPath,
} from '@nestjs/swagger';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { Transform } from 'class-transformer';
import { IsIn, IsNumberString, IsOptional } from 'class-validator';
import { toCamelCase } from 'js-convert-case';

export class PaginatedArgs {
  @IsNumberString()
  @IsOptional()
  @ApiProperty({ type: Number, required: false, default: 1 })
  page: number;

  @IsNumberString()
  @IsOptional()
  @ApiProperty({ type: Number, required: false, default: 10 })
  perPage: number;

  @IsIn(['asc', 'desc'])
  @IsOptional()
  @ApiProperty({ type: String, required: false, default: 'desc' })
  order: 'asc' | 'desc';

  @ApiProperty({ type: String, required: false, default: 'createdAt' })
  @Transform((data: { value: string }) =>
    data.value
      .split('.')
      .map((item) => toCamelCase(item))
      .join('.'),
  )
  @IsOptional()
  orderBy: string;
}

export const PaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
  withMeta = true,
) => {
  const allOf: SchemaObject[] = [
    {
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(model) },
        },
      },
    },
  ];

  if (withMeta) {
    allOf.push({
      properties: {
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            last_page: { type: 'number' },
            current_page: { type: 'number' },
            per_page: { type: 'number' },
            prev: { type: 'number' },
            next: { type: 'number' },
          },
        },
      },
    });
  }

  const extraModels: TModel[] = [model];

  return applyDecorators(
    ApiExtraModels(...extraModels),
    ApiOkResponse({
      schema: {
        title: `${model.name}Paginated`,
        allOf,
      },
    }),
  );
};

export const getPaginationMeta = (
  args: Partial<PaginatedArgs>,
  total: number,
) => {
  const currentPage = Number(args.page ?? 1);
  const perPage = Number(args.perPage ?? 10);
  const lastPage = Math.ceil(total / perPage);

  return {
    total,
    lastPage,
    currentPage,
    perPage,
    prev: currentPage - 1 > 0 ? currentPage - 1 : null,
    next: currentPage + 1 <= lastPage ? currentPage + 1 : null,
  };
};

export const sortItems = <T>(
  order: 'asc' | 'desc',
  orderBy: keyof T,
  items: T[],
) => {
  return items.sort((a, b) => {
    const aItem = a[orderBy];
    const bItem = b[orderBy];

    if (order === 'asc') {
      return aItem > bItem ? 1 : -1;
    }
    return bItem > aItem ? 1 : -1;
  });
};

export const sliceItemsByPagination = <T>(
  args: PaginatedArgs,
  items: T[],
): T[] => {
  const currentPage = Number(args.page ?? 1);
  const perPage = Number(args.perPage ?? 10);
  const { order, orderBy } = args;

  const start = (currentPage - 1) * perPage;
  const end = start + perPage;
  const orderByKey = toCamelCase(orderBy) as keyof T;
  const firstValueItem = items?.[0]?.[orderByKey];

  if (
    items.length > 0 &&
    order &&
    orderBy &&
    (['number', 'string'].includes(typeof firstValueItem) ||
      firstValueItem instanceof Date)
  ) {
    items = sortItems(order, orderByKey, items);
  }

  return items.slice(start, end);
};

import { OpenAPIObject } from '@nestjs/swagger';
import {
  OperationObject,
  ParameterObject,
  ReferenceObject,
  RequestBodyObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { toSnakeCase } from 'js-convert-case';

export const textWithoutAccents = (text: string) => {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

const transformSchema = (schema: SchemaObject & Partial<ReferenceObject>) => {
  if ('$ref' in schema || !schema) {
    return schema;
  }

  let compositeKey: 'allOf' | 'oneOf' | 'anyOf' | null = null;

  if (schema.allOf) {
    compositeKey = 'allOf';
  }

  if (schema.oneOf) {
    compositeKey = 'oneOf';
  }

  if (schema.anyOf) {
    compositeKey = 'anyOf';
  }

  if (compositeKey) {
    schema[compositeKey] = schema[compositeKey]?.map(transformSchema);
  }

  if (schema.properties) {
    const newProps: Record<string, SchemaObject> = {};

    for (const [key, value] of Object.entries(schema.properties)) {
      const snakeKey = toSnakeCase(key);
      newProps[snakeKey] = transformSchema(value);
    }

    schema.properties = newProps;

    if (schema.required) {
      schema.required = schema.required.map((field: string) =>
        toSnakeCase(field),
      );
    }
  }

  if (
    schema.additionalProperties &&
    typeof schema.additionalProperties === 'object'
  ) {
    schema.additionalProperties = transformSchema(schema.additionalProperties);
  }

  if (schema.items) {
    schema.items = transformSchema(schema.items);
  }

  return schema;
};

export const toSnakeCaseSchema = (doc: OpenAPIObject) => {
  const schemas = doc.components?.schemas ?? {};

  for (const [schemaKey, schema] of Object.entries(schemas)) {
    schemas[schemaKey] = transformSchema(schema);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const [pathKey, pathItem] of Object.entries(doc.paths)) {
    for (const method of Object.keys(pathItem)) {
      const operation = pathItem[method] as OperationObject;

      if (!operation || typeof operation !== 'object') {
        continue;
      }

      if (operation.parameters) {
        operation.parameters = operation.parameters.map(
          (param: ParameterObject) => {
            if (param.name && param.in === 'query') {
              return {
                ...param,
                name: toSnakeCase(param.name),
              };
            }
            return param;
          },
        );
      }

      if ((operation.requestBody as RequestBodyObject)?.content) {
        const data = operation.requestBody as RequestBodyObject;

        for (const contentType of Object.keys(data.content)) {
          const mediaType = data.content[contentType];

          if (mediaType.schema) {
            mediaType.schema = transformSchema(mediaType.schema);
          }
        }
      }
    }
  }

  return doc;
};

import { toSnakeCase } from 'js-convert-case';
import { EOL } from 'os';

export type TemplateArrayMap = Record<
  string,
  Record<string, string | number>[]
>;
export type TemplateVariables = Record<string, any>;

export function replaceDocumentLoops(
  arrays: TemplateArrayMap,
  content: string,
  variables: TemplateVariables = {},
): string {
  const entries = Object.entries(arrays);
  const finalTemplates: { template: string; items: string[] }[] = [];

  for (const [key, items] of entries) {
    const regex = new RegExp(
      `\\[\\[\\s*${toSnakeCase(key)}\\s*\\]\\][\\s\\S]+\\[\\[\\s*${toSnakeCase(key)}\\s*\\]\\]`,
      'gi',
    );

    const exec = regex.exec(content);

    if (!exec?.length) {
      continue;
    }

    exec.forEach((template) => {
      const regex = new RegExp(`\\[\\[\\s*${toSnakeCase(key)}\\s*\\]\\]`, 'gi');
      const templateItem = template.replace(regex, '');

      finalTemplates.push({
        template,
        items: items.map((item) =>
          replaceDocumentVariables(templateItem, {
            ...variables,
            ...item,
          }),
        ),
      });
    });
  }

  if (!finalTemplates.length) {
    return content;
  }

  let finalContent = content;

  finalTemplates.forEach(({ template, items }) => {
    finalContent = finalContent.replace(template, items.join(EOL));
  });

  return finalContent;
}

export function replaceDocumentVariables(
  content: string,
  variables: TemplateVariables = {},
): string {
  let finalContent = content;
  const entries = Object.entries(variables);
  const arrays: TemplateArrayMap = {};

  for (const [key, value] of entries) {
    if (Array.isArray(value)) {
      arrays[key] = value;
      continue;
    }

    if (typeof value === 'object' && value !== null) {
      continue;
    }

    const regex = new RegExp(`{{\\s*${toSnakeCase(key)}\\s*}}`, 'gi');
    finalContent = finalContent.replace(regex, value?.toString() ?? '');
  }

  return replaceDocumentLoops(arrays, finalContent, variables);
}

import { faker } from '@faker-js/faker';
import { PrismaClient } from '../../prisma/generated/prisma/client';

export const createActionLogItems = (total = 1, organizationId: number) => {
  const items = new Array(total).fill(true);

  return items.map(() => ({
    context: process.env.APP_NAME as string,
    action: faker.lorem.words(),
    organizationId,
    userId: faker.number.int({ max: 100 }),
    createdAt: faker.date.past(),
  }));
};
export const actionLogSeeds = async (
  prisma: PrismaClient,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  vars: Record<string, any>,
) => {
  const organizations = await prisma.organization.findMany();

  await prisma.actionLog.createMany({
    data: organizations
      .map(({ id }) => createActionLogItems(5, id))
      .reduce((result, item) => [...result, ...item], []),
  });

  return {};
};

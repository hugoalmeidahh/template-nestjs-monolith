import { faker } from '@faker-js/faker';
import { PrismaClient } from '../../prisma/generated/prisma/client';

export const createOrganizationItems = (
  total = 1,
  document?: string,
  isActive = true,
) => {
  const items = new Array(total).fill(true);

  return items.map(() => ({
    name: faker.person.fullName(),
    document: document ?? faker.finance.accountNumber(15),
    isActive,
    logoPath: faker.internet.url(),
    createdAt: faker.date.past(),
  }));
};

const vars = {
  ORG_DOCUMENT: '72315854000178',
  ORG2_DOCUMENT: '04063403000130',
};

export const organizationSeeds = async (prisma: PrismaClient) => {
  await prisma.organization.create({
    data: createOrganizationItems(1, vars.ORG_DOCUMENT)[0],
  });

  await prisma.organization.create({
    data: createOrganizationItems(1, vars.ORG2_DOCUMENT)[0],
  });

  await prisma.organization.createMany({
    data: createOrganizationItems(5),
  });

  return vars;
};

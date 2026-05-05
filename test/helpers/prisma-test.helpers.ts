import { Organization } from '../../prisma/generated/prisma/client';
import { GlobalTestsInfra } from '../global-before-all';

const GLOBAL = global as unknown as GlobalTestsInfra;

export const AUTH = ['internal', 'internal'];

export const getOrg = async (document: string) => {
  const prisma = GLOBAL.__prisma__;
  return prisma.organization.findFirst({
    where: {
      document,
    },
  }) as Promise<Organization>;
};

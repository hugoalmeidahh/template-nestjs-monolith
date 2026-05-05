import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { StartedRabbitMQContainer } from '@testcontainers/rabbitmq';
import * as amqplib from 'amqplib';
import { PrismaPg } from '@prisma/adapter-pg';
import { execSync } from 'child_process';
import { configDotenv } from 'dotenv';
import { App } from 'supertest/types';
import { PrismaClient as UserClient } from '../../prisma-user/generated/prisma/client';
import { PrismaClient } from '../../prisma/generated/prisma/client';
import { AppModule } from '../../src/app.module';
import { applyGlobalSettings } from '../../src/helpers/bootstrap.helper';
import { PrismaModule } from '../../src/providers/prisma/prisma.module';
import { postgresqlContainerStart } from '../containers/postgresql-container.test';
import { rabbitMqContainerStart } from '../containers/rabbitmq-container.test';
import { actionLogSeeds } from '../seeds/action-log.seeds-test';
import { organizationSeeds } from '../seeds/organization.seeds-test';
import { E2eInfraState, hasInfraState, readInfraState } from './infra-state';

type SeedFn = (
  prisma: PrismaClient,
  vars: Record<string, any>,
  prismaUser: UserClient,
) => Promise<Record<string, any>>;

export interface GlobalTestsInfraLike {
  __postgresql__: StartedPostgreSqlContainer;
  __userSql__: StartedPostgreSqlContainer;
  __rabbitMQq__: StartedRabbitMQContainer;
  __prisma__: PrismaClient;
  __prismaUser__: UserClient;
  __app__: INestApplication<App>;
  __constants__: Record<string, any>;
}

const logSetup = (message: string) =>
  console.log(`[e2e:setup] ${new Date().toISOString()} ${message}`);
const logTeardown = (message: string) =>
  console.log(`[e2e:teardown] ${new Date().toISOString()} ${message}`);
const logRuntime = (message: string) =>
  console.log(`[e2e:runtime] ${new Date().toISOString()} ${message}`);

const seedItems: SeedFn[] = [organizationSeeds, actionLogSeeds];

const setRuntimeEnvironment = (state: E2eInfraState) => {
  Object.assign(process.env, getRuntimeEnvironmentVariables(state));
};

export const getRuntimeEnvironmentVariables = (state: E2eInfraState) => ({
  DATABASE_URI: state.postgresqlUrl,
  DATABASE_USER_URI: state.userUrl,
  RABBITMQ_NOTIFICATION_QUEUE: 'notification',
  RABBITMQ_NOTIFICATION_URI: state.rabbitMqUrl,
  NODE_ENV: 'testing',
  LOG_LEVEL: 'warn',
});

const runPrismaReset = (command: string, env: NodeJS.ProcessEnv) => {
  execSync(command, {
    env,
    stdio: 'inherit',
  });
};

const purgeRabbitQueues = async (rabbitMqUrl: string) => {
  const connection = await amqplib.connect(rabbitMqUrl);
  const channel = await connection.createChannel();

  await channel.assertQueue(process.env.RABBITMQ_NOTIFICATION_QUEUE as string, {
    durable: true,
  });
  await channel.purgeQueue(process.env.RABBITMQ_NOTIFICATION_QUEUE as string);

  await connection.close();
};

export const resetInfraData = async (state: E2eInfraState) => {
  configDotenv();
  setRuntimeEnvironment(state);

  runPrismaReset(
    `npx prisma db push --force-reset --config=./prisma.config.ts --url="${state.postgresqlUrl}"`,
    {
      ...process.env,
      DATABASE_URI: state.postgresqlUrl,
    },
  );
  runPrismaReset(
    `npx prisma db push --force-reset --config=./prisma-user/prisma.config.ts --url="${state.userUrl}"`,
    {
      ...process.env,
      DATABASE_USER_URI: state.userUrl,
    },
  );

  await purgeRabbitQueues(state.rabbitMqUrl);
};

const createPrismaClients = (state: E2eInfraState) => ({
  prisma: new PrismaClient({
    adapter: new PrismaPg(state.postgresqlUrl),
  }),
  prismaUser: new UserClient({
    adapter: new PrismaPg(state.userUrl),
  }),
});

const initNestApp = async () => {
  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [AppModule, PrismaModule],
  }).compile();

  const app = moduleRef.createNestApplication();

  applyGlobalSettings(app);

  await app.init();

  return app;
};

export const runSeeds = async (
  prisma: PrismaClient,
  prismaUser: UserClient,
  logger: (message: string) => void = logSetup,
) => {
  let vars = {};

  for (const item of seedItems) {
    const seedName = item.name || 'seed';
    const start = Date.now();

    logger(`Executando seed: ${seedName}`);

    vars = {
      ...vars,
      ...(await item(prisma, vars, prismaUser)),
    };

    logger(`Seed ${seedName} concluído em ${(Date.now() - start) / 1000}s.`);
  }

  return vars;
};

const assignClientsToGlobal = (
  globalRef: GlobalTestsInfraLike,
  clients: ReturnType<typeof createPrismaClients>,
) => {
  globalRef.__prisma__ = clients.prisma;
  globalRef.__prismaUser__ = clients.prismaUser;
};

export const disconnectStandaloneClients = async (
  globalRef: GlobalTestsInfraLike,
) => {
  await globalRef.__prisma__?.$disconnect().catch(() => {});
  await globalRef.__prismaUser__?.$disconnect().catch(() => {});
};

export const setupFullRuntime = async (globalRef: GlobalTestsInfraLike) => {
  configDotenv();
  logSetup('Carregando variáveis de ambiente e iniciando infraestrutura...');

  const postgresqlContainer = await postgresqlContainerStart();
  const rabbitMQq = await rabbitMqContainerStart();

  setRuntimeEnvironment({
    postgresqlContainerId: postgresqlContainer.postgresqlId,
    postgresqlUrl: postgresqlContainer.postgresqlUrl,
    userContainerId: postgresqlContainer.userSqlId,
    userUrl: postgresqlContainer.userUrl,
    rabbitMqContainerId: rabbitMQq.getId(),
    rabbitMqUrl: rabbitMQq.getAmqpUrl(),
  });

  logSetup('Containers PostgreSQL disponíveis, conectando aplicações...');

  globalRef.__postgresql__ = postgresqlContainer.postgresql;
  globalRef.__userSql__ = postgresqlContainer.userSql;
  globalRef.__rabbitMQq__ = rabbitMQq;

  globalRef.__app__ = await initNestApp();
  logSetup('Aplicação Nest inicializada para testes.');

  assignClientsToGlobal(
    globalRef,
    createPrismaClients({
      postgresqlContainerId: postgresqlContainer.postgresqlId,
      postgresqlUrl: postgresqlContainer.postgresqlUrl,
      userContainerId: postgresqlContainer.userSqlId,
      userUrl: postgresqlContainer.userUrl,
      rabbitMqContainerId: rabbitMQq.getId(),
      rabbitMqUrl: rabbitMQq.getAmqpUrl(),
    }),
  );

  logSetup('Executando seeds iniciais...');
  const seedsStartedAt = Date.now();

  globalRef.__constants__ = await runSeeds(
    globalRef.__prisma__,
    globalRef.__prismaUser__,
  );

  logSetup(`Seeds concluídos em ${(Date.now() - seedsStartedAt) / 1000}s.`);

  logSetup('Infraestrutura pronta, iniciando testes E2E.');
};

export const setupReuseRuntime = async (globalRef: GlobalTestsInfraLike) => {
  configDotenv();

  if (!hasInfraState()) {
    throw new Error(
      'Infraestrutura E2E não encontrada. Execute "npm run e2e:infra:up" primeiro.',
    );
  }

  const state = readInfraState();

  logSetup('Carregando estado da infraestrutura E2E reaproveitada...');
  setRuntimeEnvironment(state);

  logSetup('Resetando bancos e filas da infraestrutura reaproveitada...');
  await resetInfraData(state);

  globalRef.__app__ = await initNestApp();
  logSetup('Aplicação Nest inicializada para testes.');

  assignClientsToGlobal(globalRef, createPrismaClients(state));

  logSetup('Executando seeds iniciais...');
  const seedsStartedAt = Date.now();

  globalRef.__constants__ = await runSeeds(
    globalRef.__prisma__,
    globalRef.__prismaUser__,
  );

  logSetup(`Seeds concluídos em ${(Date.now() - seedsStartedAt) / 1000}s.`);

  logSetup('Infraestrutura reaproveitada pronta, iniciando testes E2E.');
};

export const teardownFullRuntime = async (globalRef: GlobalTestsInfraLike) => {
  logTeardown('Encerrando aplicação Nest...');
  await globalRef.__app__?.close().catch(() => {});

  await disconnectStandaloneClients(globalRef);

  logTeardown('Parando RabbitMQ...');
  await globalRef.__rabbitMQq__?.stop().catch(() => {});

  logTeardown('Parando PostgreSQL (principal)...');
  await globalRef.__postgresql__?.stop().catch(() => {});

  logTeardown('Parando PostgreSQL (user)...');
  await globalRef.__userSql__?.stop().catch(() => {});

  logTeardown('Teardown completo. Encerrando processo de testes.');
  process.exit();
};

export const teardownReuseRuntime = async (globalRef: GlobalTestsInfraLike) => {
  logTeardown('Encerrando aplicação Nest...');
  await globalRef.__app__?.close().catch(() => {});

  await disconnectStandaloneClients(globalRef);

  logTeardown('Teardown do processo de testes concluído.');
};

export const startReusableInfra = async () => {
  configDotenv();
  process.env.TESTCONTAINERS_REUSE_ENABLE = 'true';

  logRuntime('Subindo infraestrutura E2E reaproveitável...');

  const postgresqlContainer = await postgresqlContainerStart({ reuse: true });
  const rabbitMQq = await rabbitMqContainerStart({ reuse: true });

  const state: E2eInfraState = {
    postgresqlContainerId: postgresqlContainer.postgresqlId,
    postgresqlUrl: postgresqlContainer.postgresqlUrl,
    userContainerId: postgresqlContainer.userSqlId,
    userUrl: postgresqlContainer.userUrl,
    rabbitMqContainerId: rabbitMQq.getId(),
    rabbitMqUrl: rabbitMQq.getAmqpUrl(),
  };

  setRuntimeEnvironment(state);

  return state;
};

export const resetReusableInfraAndSeed = async () => {
  const state = readInfraState();

  logRuntime('Resetando bancos e filas da infraestrutura E2E...');
  await resetInfraData(state);

  const clients = createPrismaClients(state);

  try {
    logRuntime('Reaplicando seeds...');
    await runSeeds(clients.prisma, clients.prismaUser, logRuntime);
  } finally {
    await clients.prisma.$disconnect();
    await clients.prismaUser.$disconnect();
  }
};

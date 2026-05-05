import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { StartedRabbitMQContainer } from '@testcontainers/rabbitmq';
import { GlobalTestsInfraLike, setupFullRuntime } from './e2e-runtime/runtime';

export interface GlobalTestsInfra {
  __postgresql__: StartedPostgreSqlContainer;
  __userSql__: StartedPostgreSqlContainer;
  __rabbitMQq__: StartedRabbitMQContainer;
  __prisma__: GlobalTestsInfraLike['__prisma__'];
  __prismaUser__: GlobalTestsInfraLike['__prismaUser__'];
  __app__: GlobalTestsInfraLike['__app__'];
  __constants__: Record<string, any>;
}

const GLOBAL = global as unknown as GlobalTestsInfra;

export default async () => setupFullRuntime(GLOBAL);

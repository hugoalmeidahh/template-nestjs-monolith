import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'child_process';
import { delay, getAppName } from '../helpers/test.helpers';

const log = (message: string) =>
  console.log(`[e2e:pg] ${new Date().toISOString()} ${message}`);

export const postgresqlContainerStart = async (
  options: { reuse?: boolean } = {},
) => {
  const dataLossFlag = options.reuse ? ' --accept-data-loss' : '';
  const appName = getAppName();

  const createContainer = (name: string) => {
    const container = new PostgreSqlContainer();

    if (options.reuse) {
      container.withReuse();
      container.withName(`${appName}${name}`);
    }

    return container;
  };

  log('Subindo container PostgreSQL principal...');
  const postgresql = await createContainer('e2e-postgres-main').start();
  const postgresqlUrl = `postgresql://${postgresql.getUsername()}:${postgresql.getPassword()}@${postgresql.getHost()}:${postgresql.getPort()}/${postgresql.getDatabase()}?schema=public`;

  process.env.DATABASE_URI = postgresqlUrl;

  log('Aplicando migrations principal...');
  execSync(
    `npx prisma db push --config=./prisma.config.ts --url="${postgresqlUrl}"${dataLossFlag}`,
    {
      env: {
        ...process.env,
        DATABASE_URI: postgresqlUrl,
      },
      stdio: 'inherit',
    },
  );

  await delay(1);

  log('Subindo container PostgreSQL user...');
  const userSql = await createContainer('e2e-postgres-user').start();
  const userUrl = `postgresql://${userSql.getUsername()}:${userSql.getPassword()}@${userSql.getHost()}:${userSql.getPort()}/${userSql.getDatabase()}?schema=public`;

  process.env.DATABASE_USER_URI = userUrl;

  log('Aplicando migrations (user)...');
  execSync(
    `npx prisma db push --config=./prisma-user/prisma.config.ts --url="${userUrl}"${dataLossFlag}`,
    {
      env: {
        ...process.env,
        DATABASE_USER_URI: userUrl,
      },
      stdio: 'inherit',
    },
  );

  log('Containers PostgreSQL prontos.');

  return {
    postgresql,
    postgresqlId: postgresql.getId(),
    postgresqlUrl,
    userSql,
    userSqlId: userSql.getId(),
    userUrl,
  };
};

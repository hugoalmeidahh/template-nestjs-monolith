import { execSync } from 'child_process';
import { hasInfraState, readInfraState } from './infra-state';
import { getRuntimeEnvironmentVariables } from './runtime';

const logRuntime = (message: string) =>
  console.log(`[e2e:runtime] ${new Date().toISOString()} ${message}`);

const isContainerRunning = (containerId: string) => {
  const output = execSync(
    `docker inspect -f {{.State.Running}} ${containerId}`,
    {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  return output.trim() === 'true';
};

const shellQuote = (value: string) => `'${value.replace(/'/g, `'\\''`)}'`;

// eslint-disable-next-line @typescript-eslint/require-await
const main = async () => {
  if (!hasInfraState()) {
    throw new Error(
      'Infraestrutura E2E não encontrada. Execute "npm run e2e:infra:up" primeiro.',
    );
  }

  const state = readInfraState();
  const containers = [
    ['postgresql principal', state.postgresqlContainerId],
    ['postgresql user', state.userContainerId],
    ['rabbitmq', state.rabbitMqContainerId],
  ] as const;

  for (const [name, containerId] of containers) {
    if (!isContainerRunning(containerId)) {
      throw new Error(
        `Infraestrutura E2E inconsistente: o container de ${name} (${containerId}) não está em execução.`,
      );
    }
  }

  const envs = getRuntimeEnvironmentVariables(state);

  logRuntime('Infraestrutura E2E reaproveitada está de pé.');
  console.log(
    '# Env vars controladas pela infra E2E para rodar a aplicacao localmente',
  );
  console.log(
    '# Seeds devem ser reaplicadas com "npm run e2e:infra:reset" quando necessario.',
  );
  console.log(
    '# Mocks HTTP nao sao expostos aqui porque nao sao controlados por env da infra reaproveitada.\n',
  );

  for (const [key, value] of Object.entries(envs)) {
    console.log(`${key}=${shellQuote(value)}`);
  }
};

main().catch((error) => {
  console.error(
    `[e2e:runtime] ${new Date().toISOString()} Falha ao exibir infraestrutura E2E:`,
    error,
  );
  process.exit(1);
});

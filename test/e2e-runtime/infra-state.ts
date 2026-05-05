import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs';

const STATE_PATH = '/tmp/b2c-backend-e2e-infra.state';

export interface E2eInfraState {
  postgresqlContainerId: string;
  postgresqlUrl: string;
  userContainerId: string;
  userUrl: string;
  rabbitMqContainerId: string;
  rabbitMqUrl: string;
}

const REQUIRED_KEYS: (keyof E2eInfraState)[] = [
  'postgresqlContainerId',
  'postgresqlUrl',
  'userContainerId',
  'userUrl',
  'rabbitMqContainerId',
  'rabbitMqUrl',
];

export const getInfraStatePath = () => STATE_PATH;

export const hasInfraState = () => existsSync(STATE_PATH);

export const readInfraState = (): E2eInfraState => {
  const content = readFileSync(STATE_PATH, 'utf8');
  const params = new URLSearchParams(content);

  const state = Object.fromEntries(params.entries()) as Partial<E2eInfraState>;

  for (const key of REQUIRED_KEYS) {
    if (!state[key]) {
      throw new Error(`Missing "${key}" in persisted E2E infra state`);
    }
  }

  return state as E2eInfraState;
};

export const writeInfraState = (state: E2eInfraState) => {
  const params = new URLSearchParams();

  for (const key of REQUIRED_KEYS) {
    params.set(key, state[key]);
  }

  writeFileSync(STATE_PATH, params.toString(), 'utf8');
};

export const removeInfraState = () => {
  if (existsSync(STATE_PATH)) {
    unlinkSync(STATE_PATH);
  }
};

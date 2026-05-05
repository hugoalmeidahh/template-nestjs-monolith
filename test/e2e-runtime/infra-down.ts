import { execSync } from 'child_process';
import { hasInfraState, readInfraState, removeInfraState } from './infra-state';

// eslint-disable-next-line @typescript-eslint/require-await
const main = async () => {
  if (!hasInfraState()) {
    console.log(
      `[e2e:runtime] ${new Date().toISOString()} Nenhum estado persistido de infraestrutura E2E encontrado.`,
    );
    return;
  }

  const state = readInfraState();
  const containerIds = [
    ...new Set(
      [
        state.rabbitMqContainerId,
        state.postgresqlContainerId,
        state.userContainerId,
      ].filter(Boolean),
    ),
  ];

  for (const containerId of containerIds) {
    try {
      execSync(`docker rm -f ${containerId}`, {
        stdio: 'inherit',
      });
    } catch {
      console.warn(
        `[e2e:runtime] ${new Date().toISOString()} Não foi possível remover o container ${containerId}.`,
      );
    }
  }

  removeInfraState();

  console.log(
    `[e2e:runtime] ${new Date().toISOString()} Infraestrutura E2E removida.`,
  );
};

main().catch((error) => {
  console.error(
    `[e2e:runtime] ${new Date().toISOString()} Falha ao remover infraestrutura E2E:`,
    error,
  );
  process.exit(1);
});

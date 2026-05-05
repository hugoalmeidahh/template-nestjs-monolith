import { hasInfraState } from './infra-state';
import { resetReusableInfraAndSeed } from './runtime';

const main = async () => {
  if (!hasInfraState()) {
    throw new Error(
      'Infraestrutura E2E não encontrada. Execute "npm run e2e:infra:up" primeiro.',
    );
  }

  await resetReusableInfraAndSeed();

  console.log(
    `[e2e:runtime] ${new Date().toISOString()} Infraestrutura E2E resetada com sucesso.`,
  );
};

main().catch((error) => {
  console.error(
    `[e2e:runtime] ${new Date().toISOString()} Falha ao resetar infraestrutura E2E:`,
    error,
  );
  process.exit(1);
});

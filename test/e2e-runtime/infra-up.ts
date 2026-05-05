import { writeInfraState } from './infra-state';
import { startReusableInfra } from './runtime';

const main = async () => {
  const state = await startReusableInfra();

  writeInfraState(state);

  console.log(
    `[e2e:runtime] ${new Date().toISOString()} Infraestrutura E2E pronta para reuso.`,
  );
};

main().catch((error) => {
  console.error(
    `[e2e:runtime] ${new Date().toISOString()} Falha ao subir infraestrutura E2E:`,
    error,
  );
  process.exit(1);
});

import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import { configDotenv } from 'dotenv';
import { writeFile } from 'fs';
import { EOL } from 'os';
import { resolve } from 'path';
import { promisify } from 'util';

const Write = promisify(writeFile);

configDotenv();

export const secretsConfig = async () => {
  const env = process.env.NODE_ENV;
  const secretId = process.env.AWS_SECRET_ID;

  if ((env !== 'production' && env !== 'staging') || !secretId) {
    return;
  }

  const secretClient = new SecretsManagerClient();

  const response = await secretClient.send(
    new GetSecretValueCommand({
      SecretId: secretId,
      VersionStage: 'AWSCURRENT',
    }),
  );

  const secrets = JSON.parse(response.SecretString ?? '{}') as Record<
    string,
    string
  >;

  if (!Object.keys(secrets).length) {
    return;
  }

  await Write(
    resolve(__dirname, '..', '..', '.env'),
    Object.entries(secrets).reduce(
      (result, [key, value]) => `${key}="${value}"${EOL}${result}`,
      '',
    ),
  );
};

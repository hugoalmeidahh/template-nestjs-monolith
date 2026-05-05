import { RabbitMQContainer } from '@testcontainers/rabbitmq';
import * as amqplib from 'amqplib';
import { getAppName } from '../helpers/test.helpers';

const log = (message: string) =>
  console.log(`[e2e:rabbit] ${new Date().toISOString()} ${message}`);

export const rabbitMqContainerStart = async (
  options: { reuse?: boolean } = {},
) => {
  const appName = getAppName();

  process.env.RABBITMQ_NOTIFICATION_QUEUE = 'notification';

  log('Subindo container RabbitMQ...');
  const rabbitMqContainer = new RabbitMQContainer().withStartupTimeout(120_000);

  if (options.reuse) {
    rabbitMqContainer.withReuse();
    rabbitMqContainer.withName(`${appName}e2e-rabbitmq`);
  }

  const rabbitMQq = await rabbitMqContainer.start();
  const rabbitUrl = rabbitMQq.getAmqpUrl();
  const connection = await amqplib.connect(rabbitUrl);
  const channel = await connection.createChannel();

  log(
    `Declarando fila ${process.env.RABBITMQ_NOTIFICATION_QUEUE} em ${rabbitUrl}...`,
  );
  await channel.assertQueue(process.env.RABBITMQ_NOTIFICATION_QUEUE, {
    durable: true,
  });

  await connection.close();

  process.env.RABBITMQ_NOTIFICATION_URI = rabbitUrl;
  log('RabbitMQ pronto.');

  return rabbitMQq;
};

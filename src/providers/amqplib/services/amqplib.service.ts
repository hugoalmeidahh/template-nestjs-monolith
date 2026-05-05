import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqplib from 'amqplib';
import { InternalProviderError } from '../../../errors/internal-provider.error';

@Injectable()
export class AmqplibService {
  private logger = new Logger(AmqplibService.name);
  private queues: Record<string, { url: string; queue: string }> = {};
  private channels: Record<string, amqplib.Channel> = {};

  constructor(config: ConfigService) {
    this.queues.notification = {
      queue: config.getOrThrow('RABBITMQ_NOTIFICATION_QUEUE'),
      url: config.getOrThrow('RABBITMQ_NOTIFICATION_URI'),
    };
  }

  private async connect(queue: string, newConnection = false) {
    if (!this.channels[queue] || newConnection) {
      this.logger.debug(`connecting to ${queue} queue`);
      const connection = await amqplib.connect(this.queues[queue].url);
      this.channels[queue] = await connection.createChannel();
    }
    return this.channels[queue];
  }

  private send(message: Buffer, queue: string, channel: amqplib.Channel) {
    this.logger.debug(`sending event to ${queue} queue`);
    return channel.sendToQueue(this.queues[queue].queue, message);
  }

  async sendToQueue<T>(payload: T, queue = 'notification') {
    if (!this.queues[queue]) {
      throw new InternalProviderError(
        `invalid ${queue} amqplib queue`,
        'amqplib',
      );
    }
    const message = Buffer.from(JSON.stringify(payload));
    let channel = await this.connect(queue);

    try {
      return this.send(message, queue, channel);
    } catch (e) {
      this.logger.warn(
        `trying to reconnect rabbit ${queue} queue: ${e.message}`,
      );
      channel = await this.connect(queue, true);
      return this.send(message, queue, channel);
    }
  }
}

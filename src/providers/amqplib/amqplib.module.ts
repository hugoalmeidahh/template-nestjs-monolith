import { Module } from '@nestjs/common';
import { AmqplibService } from './services/amqplib.service';

@Module({
  providers: [AmqplibService],
  exports: [AmqplibService],
})
export class AmqplibModule {}

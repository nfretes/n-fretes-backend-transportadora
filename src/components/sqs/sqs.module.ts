import { Module } from '@nestjs/common';
import { SQSService } from './sqs.service';
import { SQSConsumerService } from './sqs-consumer.service';
import { SqsController } from './sqs.controller';

@Module({
  controllers: [SqsController],
  providers: [SQSService, SQSConsumerService],
  exports: [SQSService],
})
export class SqsModule {}

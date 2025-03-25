import { Module } from '@nestjs/common';
import { SQSService } from './sqs.service';
import { SqsController } from './sqs.controller';

@Module({

  controllers: [SqsController],
  providers: [SQSService],
  exports: [SQSService],
})
export class SqsModule {}
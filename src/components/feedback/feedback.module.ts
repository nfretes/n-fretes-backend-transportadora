import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackEnd } from 'src/entities/feedbacks.entity';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { AwsService } from '../aws/aws.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([FeedbackEnd]), ConfigModule],
  providers: [FeedbackService, AwsService],
  controllers: [FeedbackController],
  exports: [FeedbackService],
})
export class FeedbackModule {}

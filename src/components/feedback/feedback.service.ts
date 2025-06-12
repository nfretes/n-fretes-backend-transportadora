import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeedbackEnd } from 'src/entities/feedbacks.entity';
import { AwsService } from '../aws/aws.service';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(FeedbackEnd)
    private readonly feedbackRepository: Repository<FeedbackEnd>,
    private readonly awsService: AwsService,
  ) {}

  async createFeedback({
    userId,
    description,
    imageBase64,
  }: {
    userId: string;
    description: string;
    imageBase64?: string;
  }): Promise<FeedbackEnd> {
    let imageUrl: string | undefined = undefined;
    if (imageBase64) {
      const key = `feedbacks/${userId}_${Date.now()}.jpg`;
      const bucket = this.awsService['configService'].get<string>('AWS_S3_BUCKET_NAME');
      imageUrl = await this.awsService.uploadAvatar(
        bucket,
        key,
        imageBase64,
      );
    }
    const feedback = this.feedbackRepository.create({
      userId,
      description,
      imageUrl,
      resolved: false,
    });
    return this.feedbackRepository.save(feedback);
  }
}

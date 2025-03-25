import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SQSService {
  private sqsClient: SQSClient;
  private readonly queueUrlFreightSharing =
    process.env.QUEUE_SHARING_NOTIFICATION_FREIGHT;

  constructor(private configService: ConfigService) {
    this.sqsClient = new SQSClient({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async sendMessage(
    queueUrl: string,
    message: any,
    messageGroupId?: string,
  ): Promise<void> {
    const params = {
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(message),
      ...(messageGroupId && { MessageGroupId: messageGroupId }),
    };

    try {
      const command = new SendMessageCommand(params);
      await this.sqsClient.send(command);
    } catch (error) {
      console.error('Error sending message to SQS:', error);
      throw error;
    }
  }

  async notifyFreightSharing(
    freightId: string,
    userIds: string[],
  ): Promise<void> {
    try {
      const payload = {
        freightId,
        userIds,
        timestamp: new Date().toISOString(),
      };

      await this.sendMessage(this.queueUrlFreightSharing, payload);
    } catch (error) {
      console.log(error);
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}

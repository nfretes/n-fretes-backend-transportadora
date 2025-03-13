import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

@Injectable()
export class AwsService {
  private s3: AWS.S3;
  private rekognition: AWS.Rekognition;

  constructor(private configService: ConfigService) {
    AWS.config.update({
      region: this.configService.get<string>('AWS_REGION', 'us-east-1'),
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
    });

    this.s3 = new AWS.S3();
    this.rekognition = new AWS.Rekognition();
  }

  async uploadFile(
    bucketName: string,
    key: string,
    fileContent: Buffer,
  ): Promise<string> {
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: fileContent,
      ContentType: 'image/jpeg',
    };

    const uploadResult = await this.s3.upload(params).promise();
    return uploadResult.Location;
  }

  async compareFaces(sourceImage: Buffer, targetImage: Buffer) {
    const params = {
      SourceImage: { Bytes: sourceImage },
      TargetImage: { Bytes: targetImage },
      SimilarityThreshold: 70,
    };

    const result = await this.rekognition.compareFaces(params).promise();
    return result.FaceMatches;
  }

  async uploadAvatar(
    bucketName: string,
    key: string,
    base64String: string,
  ): Promise<string> {
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');

    const buffer = Buffer.from(base64Data, 'base64');

    const params = {
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: 'image/jpeg',
    };

    const uploadResult = await this.s3.upload(params).promise();
    return uploadResult.Location;
  }
}

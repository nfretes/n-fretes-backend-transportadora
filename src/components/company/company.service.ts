import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';

import { Company } from '@entities/company.entity';
import { companyUpdateDto } from './dto/Company.dto';
import { AwsService } from '@components/aws/aws.service';
import { ConfigService } from '@nestjs/config';

export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    private readonly awsService: AwsService,
    private readonly configService: ConfigService,
  ) {}

  async updateUserIdCompany(
    userId: string,
    updateCompany: companyUpdateDto,
  ): Promise<{ message: string }> {
    try {
      const company = await this.companyRepository.findOne({
        where: { id: userId },
      });

      if (!company) {
        throw new HttpException(
          'Não foi possivel atualizar a empresa',
          HttpStatus.BAD_REQUEST,
        );
      }

      let photoUrl = company.photoUrl;

      if (updateCompany.photoUrl) {
        const bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
        const key = `avatars/${company.nameFantasy}-${userId}.jpg`;

        photoUrl = await this.awsService.uploadAvatar(
          bucketName,
          key,
          updateCompany.photoUrl,
        );
      }

      await this.companyRepository.update(
        { id: company.id },
        { ...updateCompany, photoUrl },
      );

      return {
        message: 'Empresa atualizada com sucesso',
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao atualizar empresa',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


 
}

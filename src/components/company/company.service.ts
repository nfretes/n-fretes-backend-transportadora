import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';

import { Company } from '@entities/company.entity';
import { SubscriptionCompany } from '@entities/subscription-company.entity';
import { companyUpdateDto } from './dto/Company.dto';
import { AwsService } from '@components/aws/aws.service';
import { ConfigService } from '@nestjs/config';

export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(SubscriptionCompany)
    private subscriptionCompanyRepository: Repository<SubscriptionCompany>,
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

  async checkIsSucess(userId: string): Promise<{ isSucess: boolean }> {
    try {
      const company = await this.companyRepository.findOne({
        where: { id: userId },
        select: ['isSucess'],
      });

      if (!company) {
        throw new HttpException(
          'Empresa não encontrada',
          HttpStatus.NOT_FOUND,
        );
      }

      return { isSucess: company.isSucess };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao verificar status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateIsSucess(userId: string): Promise<{ message: string }> {
    try {
      const company = await this.companyRepository.findOne({
        where: { id: userId },
      });

      if (!company) {
        throw new HttpException(
          'Empresa não encontrada',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.companyRepository.update(
        { id: userId },
        { isSucess: true },
      );

      return {
        message: 'Status atualizado com sucesso',
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao atualizar status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async checkSubscriptionValidity(userId: string): Promise<{
    isValid: boolean;
    status: number;
    isInTrial: boolean;
    trialEndDate: Date | null;
    message: string;
  }> {
    try {
      const subscription = await this.subscriptionCompanyRepository.findOne({
        where: { companyId: userId },
        relations: ['plan'],
      });

      if (!subscription) {
        return {
          isValid: false,
          status: 0,
          isInTrial: false,
          trialEndDate: null,
          message: 'Empresa não possui assinatura',
        };
      }

      const now = new Date();
      const trialEnd = subscription.trialEndDate
        ? new Date(subscription.trialEndDate)
        : null;

      let isValid = false;
      let message = '';
      let needsStatusUpdate = false;
      let newStatus = subscription.status;

      // Verifica se está em trial e se ainda é válido
      if (subscription.isInTrial && trialEnd) {
        if (now <= trialEnd) {
          isValid = true;
          message = 'Assinatura em período trial válido';
        } else {
          // Trial expirado - atualiza para status OVERDUE (3)
          isValid = false;
          message = 'Período trial expirado';
          needsStatusUpdate = true;
          newStatus = 3; // OVERDUE
        }
      } else if (subscription.status === 1) {
        // Status 1 = ACTIVE
        isValid = true;
        message = 'Assinatura ativa';
      } else if (subscription.status === 2) {
        // Status 2 = CANCELED
        isValid = false;
        message = 'Assinatura cancelada';
      } else if (subscription.status === 3) {
        // Status 3 = OVERDUE
        isValid = false;
        message = 'Assinatura em atraso';
      } else {
        isValid = false;
        message = 'Status de assinatura inválido';
      }

      // Atualiza o status se necessário
      if (needsStatusUpdate) {
        await this.subscriptionCompanyRepository.update(
          { id: subscription.id },
          { status: newStatus },
        );
      }

      return {
        isValid,
        status: newStatus,
        isInTrial: subscription.isInTrial,
        trialEndDate: trialEnd,
        message,
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao verificar validade da assinatura',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

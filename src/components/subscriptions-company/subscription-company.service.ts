import { SubscriptionCompany } from '@entities/subscription-company.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateSubscriptionCompanyDto,  CreateSubscriptionDto} from './dto/subscription-company.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import {
  SubscriptionCompanyResponseDto,
  SubscriptionUpdateCompanyResponseDto,
} from './dto/response-subscription.dto';

export class SubscriptionCompanyService {
  constructor(
    @InjectRepository(SubscriptionCompany)
    private subscriptionCompanyRepository: Repository<SubscriptionCompany>,
  ) {}

  async createSubscription(
    createSubscriptionDto: CreateSubscriptionDto,
  ): Promise<SubscriptionCompanyResponseDto> {
    try {
      const createSubscription = this.subscriptionCompanyRepository.create(
        createSubscriptionDto,
      );
      const savedSubscription =
        await this.subscriptionCompanyRepository.save(createSubscription);

      return savedSubscription;
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao criar a subscrição',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateSubscription(
    companyId: string,
    updateSubscriptionDto: UpdateSubscriptionCompanyDto,
  ): Promise<SubscriptionUpdateCompanyResponseDto> {
    try {
      const subscriptionCompany =
        await this.subscriptionCompanyRepository.findOne({
          where: { companyId },
        });

      if (!subscriptionCompany) {
        throw new HttpException(
          'Não foi localizada uma subscrição para essa empresa',
          HttpStatus.BAD_REQUEST,
        );
      }

      const updateResult = await this.subscriptionCompanyRepository.update(
        { companyId },
        updateSubscriptionDto,
      );

      if (updateResult.affected === 0) {
        throw new HttpException(
          'Nenhuma alteração foi realizada na subscrição',
          HttpStatus.BAD_REQUEST,
        );
      }

      return {
        message: 'Subscrição atualizada com sucesso',
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao atualizar a subscrição',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

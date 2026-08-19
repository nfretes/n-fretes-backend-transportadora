import {
  Injectable,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '@entities/company.entity';
import { Freight } from '@entities/freight.entity';
import { ContactCompany } from '@entities/contact-company.entity';
import { CreateFreightWebhookDto } from '../dto/create-freight-webhook.dto';
import { UpdateFreightWebhookDto } from '../dto/update-freight-webhook.dto';
import { CityDistanceService } from './city-distance.service';
import {
  FreightLocal,
  PaymentMethod,
  Toll,
  TypeOfLoad,
} from '../../../../enum/freight';

@Injectable()
export class SiimpWebhookService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(Freight)
    private freightRepository: Repository<Freight>,
    @InjectRepository(ContactCompany)
    private contactCompanyRepository: Repository<ContactCompany>,
    private cityDistanceService: CityDistanceService,
  ) {}

  async authenticateCompany(
    username: string,
    password: string,
  ): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: {
        siimpUsername: username,
        siimpPassword: password,
        siimpIntegrationActive: true,
      },
    });

    if (!company) {
      throw new UnauthorizedException(
        'Credenciais inválidas ou integração SIIMP não ativa',
      );
    }

    return company;
  }

  async createFreight(
    username: string,
    password: string,
    createFreightDto: CreateFreightWebhookDto,
  ): Promise<any> {
    try {
      this.validateRequiredFields(createFreightDto);

      const company = await this.authenticateCompany(username, password);

      const firstContact = await this.contactCompanyRepository.findOne({
        where: {
          companyId: company.id,
          isActive: true,
        },
        order: { createdAt: 'ASC' },
      });

      const distanceData =
        await this.cityDistanceService.calculateDistanceBetweenCities(
          createFreightDto.originCity,
          createFreightDto.originState,
          createFreightDto.destinyCity,
          createFreightDto.destinyState,
        );

      const freight = this.freightRepository.create({
        companyId: company.id,
        shippingLocation: FreightLocal.NATIONAL,
        originCity: createFreightDto.originCity,
        originState: createFreightDto.originState,
        destinyCity: createFreightDto.destinyCity,
        destinyState: createFreightDto.destinyState,
        dateOrigin: createFreightDto.dateOrigin
          ? new Date(createFreightDto.dateOrigin)
          : null,
        dateReceiver: new Date(createFreightDto.dateReceiver),
        typeOfLoad: createFreightDto.typeOfLoad || TypeOfLoad.COMPLETE,
        lona: createFreightDto.lona || false,
        tracker: createFreightDto.tracker || false,
        product: createFreightDto.product,
        specieOfLoad: createFreightDto.specieOfLoad,
        weightOfLoad: createFreightDto.weightOfLoad,
        observation: createFreightDto.observation || '',
        unityMetric: createFreightDto.valueCall,
        valueCall: createFreightDto.valueCall,
        calValue: PaymentMethod.TOCOMBINE,
        Toll: Toll.PAYMENTPARTY,
        distance: distanceData.distance.toString(),
        originLatitude: distanceData.originLatitude,
        originLongitude: distanceData.originLongitude,
        destinyLatitude: distanceData.destinyLatitude,
        destinyLongitude: distanceData.destinyLongitude,
        isActive: true,
        openSolicitations: true,
        vehicleTypes: [createFreightDto.vehicleTypes] as any,
        bodyTypes: [createFreightDto.bodyTypes] as any,
        contactCompanyId: firstContact ? firstContact.id : null,
      });

      await this.freightRepository.save(freight);

      return {
        message: 'Frete criado com sucesso via webhook SIIMP',
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof HttpException
      ) {
        throw error;
      }

      console.error('Erro ao criar frete via SIIMP webhook:', error);
      throw new HttpException(
        'Erro interno ao processar criação do frete',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private validateRequiredFields(
    createFreightDto: CreateFreightWebhookDto,
  ): void {
    const requiredFields = [
      { field: 'originCity', value: createFreightDto.originCity },
      { field: 'originState', value: createFreightDto.originState },
      { field: 'destinyCity', value: createFreightDto.destinyCity },
      { field: 'destinyState', value: createFreightDto.destinyState },
      { field: 'dateReceiver', value: createFreightDto.dateReceiver },
      { field: 'product', value: createFreightDto.product },
      { field: 'specieOfLoad', value: createFreightDto.specieOfLoad },
      { field: 'weightOfLoad', value: createFreightDto.weightOfLoad },
      { field: 'valueCall', value: createFreightDto.valueCall },
      { field: 'vehicleTypes', value: createFreightDto.vehicleTypes },
      { field: 'bodyTypes', value: createFreightDto.bodyTypes },
    ];

    const missingFields = requiredFields
      .filter(
        ({ value }) =>
          !value || (typeof value === 'string' && value.trim() === ''),
      )
      .map(({ field }) => field);

    if (missingFields.length > 0) {
      throw new HttpException(
        {
          message: 'Campos obrigatórios não preenchidos',
          error: 'Bad Request',
          statusCode: 400,
          missingFields: missingFields,
          details: `Os seguintes campos são obrigatórios: ${missingFields.join(', ')}`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getCompanyFreights(
    username: string,
    password: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: Freight[];
    total: number;
    page: number;
    limit: number;
  }> {
    const company = await this.authenticateCompany(username, password);

    const [freights, total] = await this.freightRepository.findAndCount({
      where: { companyId: company.id, isExclude: false },
      relations: ['contactCompany'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: freights,
      total,
      page,
      limit,
    };
  }

  async updateFreight(
    username: string,
    password: string,
    freightId: string,
    updateFreightDto: UpdateFreightWebhookDto,
  ): Promise<any> {
    try {
      const company = await this.authenticateCompany(username, password);

      const freight = await this.freightRepository.findOne({
        where: { id: freightId, companyId: company.id, isExclude: false },
      });

      if (!freight) {
        throw new HttpException(
          'Frete não encontrado ou não pertence à empresa',
          HttpStatus.NOT_FOUND,
        );
      }

      const updateData: any = { ...updateFreightDto };

      if (updateFreightDto.dateOrigin) {
        updateData.dateOrigin = new Date(updateFreightDto.dateOrigin);
      }

      if (updateFreightDto.dateReceiver) {
        updateData.dateReceiver = new Date(updateFreightDto.dateReceiver);
      }

      if (updateFreightDto.vehicleTypes) {
        updateData.vehicleTypes = [updateFreightDto.vehicleTypes];
      }

      if (updateFreightDto.bodyTypes) {
        updateData.bodyTypes = [updateFreightDto.bodyTypes];
      }

      if (
        (updateFreightDto.originCity && updateFreightDto.originState) ||
        (updateFreightDto.destinyCity && updateFreightDto.destinyState)
      ) {
        const originCity = updateFreightDto.originCity || freight.originCity;
        const originState = updateFreightDto.originState || freight.originState;
        const destinyCity = updateFreightDto.destinyCity || freight.destinyCity;
        const destinyState =
          updateFreightDto.destinyState || freight.destinyState;

        const distanceData =
          await this.cityDistanceService.calculateDistanceBetweenCities(
            originCity,
            originState,
            destinyCity,
            destinyState,
          );

        updateData.distance = distanceData.distance.toString();
        updateData.originLatitude = distanceData.originLatitude;
        updateData.originLongitude = distanceData.originLongitude;
        updateData.destinyLatitude = distanceData.destinyLatitude;
        updateData.destinyLongitude = distanceData.destinyLongitude;
      }

      await this.freightRepository.update(freightId, updateData);

      return {
        message: 'Frete atualizado com sucesso via webhook SIIMP',
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof HttpException
      ) {
        throw error;
      }

      console.error('Erro ao atualizar frete via SIIMP webhook:', error);
      throw new HttpException(
        'Erro interno ao atualizar frete',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteFreight(
    username: string,
    password: string,
    freightId: string,
  ): Promise<any> {
    try {
      const company = await this.authenticateCompany(username, password);

      const freight = await this.freightRepository.findOne({
        where: { id: freightId, companyId: company.id, isExclude: false },
      });

      if (!freight) {
        throw new HttpException(
          'Frete não encontrado ou não pertence à empresa',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.freightRepository.update(freightId, {
        isExclude: true,
        isActive: false,
        openSolicitations: false,
      });

      return {
        message: 'Frete excluído com sucesso via webhook SIIMP',
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof HttpException
      ) {
        throw error;
      }

      console.error('Erro ao excluir frete via SIIMP webhook:', error);
      throw new HttpException(
        'Erro interno ao excluir frete',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

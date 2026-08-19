import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ContactCompany } from '@entities/contact-company.entity';
import { Freight } from '@entities/freight.entity';
import {
  CreateContactCompanyDto,
  UpdateContactCompanyDto,
} from './dto/contact-company.dto';
import {
  ContactCompanyResponseDto,
  ContactCompanyUpdateResponseDto,
  GetContactCompanyResponseDto,
} from './dto/response-contact-company.dto';
import { ParamsContactCompany } from './interfaces/IContact';
import { PaginationService } from '@components/pagination/pagination.service';

export class ContactCompanyService {
  constructor(
    @InjectRepository(ContactCompany)
    private contactCompanyRepository: Repository<ContactCompany>,
    @InjectRepository(Freight)
    private freightRepository: Repository<Freight>,
    private readonly paginationService: PaginationService,
  ) {}

  async createContactCompany(
    createContactCompanyDto: CreateContactCompanyDto,
    userId: string,
  ): Promise<ContactCompanyResponseDto> {
    try {
      const body = {
        ...createContactCompanyDto,
        companyId: userId,
      };
      const createContactCompany = this.contactCompanyRepository.create(body);
      const savedContactCompany =
        await this.contactCompanyRepository.save(createContactCompany);

      return savedContactCompany;
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao criar ao criar o contato da empresa',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateContactCompany(
    id: string,
    updateContactCompanyDto: UpdateContactCompanyDto,
    companyId: string,
  ): Promise<ContactCompanyUpdateResponseDto> {
    try {
      const contactCompany = await this.contactCompanyRepository.findOne({
        where: { id, companyId },
      });

      if (!contactCompany) {
        throw new HttpException(
          'Não foi localizado esse contato da empresa ou você não tem permissão para alterá-lo',
          HttpStatus.BAD_REQUEST,
        );
      }

      const updateResult = await this.contactCompanyRepository.update(
        { id },
        updateContactCompanyDto,
      );

      if (updateResult.affected === 0) {
        throw new HttpException(
          'Nenhuma alteração foi alterado no contato',
          HttpStatus.BAD_REQUEST,
        );
      }

      return {
        message: 'Contato atualizada com sucesso',
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao atualizar a subscrição',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getContactId(id: string, companyId: string): Promise<ContactCompanyResponseDto> {
    try {
      const contactCompany = await this.contactCompanyRepository.findOne({
        where: { id, companyId },
      });

      if (!contactCompany) {
        throw new HttpException(
          'Não foi localizado esse contato da empresa ou você não tem permissão para acessá-lo',
          HttpStatus.BAD_REQUEST,
        );
      }

      return contactCompany;
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao buscar contato da empresa',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getCompanyId(
    params: ParamsContactCompany,
    companyId: string,
  ): Promise<GetContactCompanyResponseDto> {
    try {
      const queryBuilder =
        this.contactCompanyRepository.createQueryBuilder('contact-company');
      const { take = 10, page = 1 } =
        this.paginationService.getDefaultPaginationParams(params);

      queryBuilder.andWhere('contact-company.companyId = :companyId', {
        companyId,
      });

      if (params.isActive) {
        queryBuilder.andWhere('contact-company.isActive = :isActive', {
          isActive: params.isActive,
        });
      }
      if (params.name) {
        queryBuilder.andWhere(
          '(unaccent(LOWER(contact-company.name)) ILIKE unaccent(LOWER(:name)))',
          { name: `%${params.name}%` },
        );
      }

      if (params.phoneNumber) {
        queryBuilder.andWhere(
          'contact-company.phoneNumber ILIKE :phoneNumber',
          { phoneNumber: `%${params.phoneNumber}%` },
        );
      }

      const [result, total] = await queryBuilder

        .leftJoin('contact-company.company', 'company')
        .addSelect('company.email')
        .addSelect('company.cnpj')
        .addSelect('company.name')
        .orderBy('contact-company.name', 'ASC')
        .skip((page - 1) * take)
        .take(take)
        .getManyAndCount();

      return {
        data: result,
        count: total,
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao buscar contato da empresa',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async softDeleteUsersContactCompany(id: string, companyId: string): Promise<string> {
    const queryRunner =
      this.contactCompanyRepository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const usersContactCompany = await queryRunner.manager.findOne(
        ContactCompany,
        {
          where: { id, companyId },
        },
      );

      if (!usersContactCompany) {
        throw new HttpException(
          'Não foi localizado um contato para essa empresa ou você não tem permissão para desativá-lo',
          HttpStatus.BAD_REQUEST,
        );
      }
      await queryRunner.manager.update(
        ContactCompany,
        { id },
        { isActive: false },
      );
      await queryRunner.commitTransaction();

      return 'Contato desativado com sucesso';
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        error?.message || 'Erro ao desativar contato da empresa',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getContactCompanyById(id: string): Promise<ContactCompany> {
    try {
      const contact = await this.contactCompanyRepository.findOne({
        where: { id },
      });

      if (!contact) {
        throw new HttpException('Contato não encontrado', HttpStatus.NOT_FOUND);
      }

      return contact;
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao buscar contato',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getActiveFreightsByContact(
    contactId: string,
    companyId: string,
  ): Promise<any[]> {
    try {
     
      const contact = await this.contactCompanyRepository.findOne({
        where: { id: contactId, companyId },
      });

      if (!contact) {
        throw new HttpException(
          'Contato não encontrado ou você não tem permissão para acessá-lo',
          HttpStatus.BAD_REQUEST,
        );
      }

    
      const freights = await this.freightRepository
        .createQueryBuilder('freight')
        .where('freight.isActive = :isActive', { isActive: true })
        .andWhere('freight.openSolicitations = :openSolicitations', { openSolicitations: true })
        .andWhere(
          '(freight.contactCompanyId = :contactId OR :contactId = ANY(string_to_array(freight.contactCompanyIds, \',\')))',
          { contactId }
        )
        .select([
          'freight.id',
          'freight.originCity',
          'freight.originState',
          'freight.destinyCity',
          'freight.destinyState',
          'freight.product',
          'freight.specieOfLoad',
          'freight.weightOfLoad',
          'freight.vehicleTypes',
          'freight.bodyTypes',
          'freight.createdAt',
        ])
        .orderBy('freight.createdAt', 'DESC')
        .getMany();

      return freights.map((freight) => ({
        id: freight.id,
        origem: {
          cidade: freight.originCity,
          estado: freight.originState,
        },
        destino: {
          cidade: freight.destinyCity,
          estado: freight.destinyState,
        },
        carga: {
          produto: freight.product,
          especie: freight.specieOfLoad,
          peso: freight.weightOfLoad,
        },
        veiculoNecessario: {
          tiposVeiculo: freight.vehicleTypes,
          tiposCarroceria: freight.bodyTypes,
        },
        dataCriacao: freight.createdAt,
      }));
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao buscar fretes do contato',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

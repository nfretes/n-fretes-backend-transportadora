import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ContactCompany } from '@entities/contact-company.entity';
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
    private readonly paginationService: PaginationService,
  ) {}

  async createContactCompany(
    createContactCompanyDto: CreateContactCompanyDto,
  ): Promise<ContactCompanyResponseDto> {
    try {
      const createContactCompany = this.contactCompanyRepository.create(
        createContactCompanyDto,
      );
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
  ): Promise<ContactCompanyUpdateResponseDto> {
    try {
      const contactCompany = await this.contactCompanyRepository.findOne({
        where: { id },
      });

      if (!contactCompany) {
        throw new HttpException(
          'Não foi localizado esse contato da empresa',
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

  async getContactId(id: string): Promise<ContactCompanyResponseDto> {
    try {
      const contactCompany = await this.contactCompanyRepository.findOne({
        where: { id },
      });

      if (!contactCompany) {
        throw new HttpException(
          'Não foi localizado esse contato da empresa',
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
  ): Promise<GetContactCompanyResponseDto> {
    try {
      const queryBuilder =
        this.contactCompanyRepository.createQueryBuilder('contact-company');
      const { take, page } =
        this.paginationService.getDefaultPaginationParams(params);

  


      if (params.companyId) {
        queryBuilder.andWhere('contact-company.companyId = :companyId', {
          companyId: params.companyId,
        });
      }

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
}

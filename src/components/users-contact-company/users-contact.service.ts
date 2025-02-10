import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CompanyUsersContacts } from '@entities/company-users-contacts.entity';
import {
  CompanyUsersContactsDto,
  updateCompanyUsersContactsDto,
} from './dto/users-contact.dto';
import {
  GetCompanyUsersContactsResponseDto,
  UsersContactUpdateCompanyResponseDto,
} from './dto/response-contact-company.dto';
import { ParamsUsersContactCompany } from './interfaces/IUsersContanctCompany';
import { PaginationService } from '@components/pagination/pagination.service';

export class UsersContactCompanyService {
  constructor(
    @InjectRepository(CompanyUsersContacts)
    private usersContactCompanyRepository: Repository<CompanyUsersContacts>,
    private readonly paginationService: PaginationService,
  ) {}

  async createUsersContactCompany(
    createContactCompany: CompanyUsersContactsDto,
  ): Promise<CompanyUsersContactsDto> {
    try {
      const create =
        this.usersContactCompanyRepository.create(createContactCompany);
      const save = await this.usersContactCompanyRepository.save(create);

      return save;
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao criar contanto da empresa',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateUsersContactCompany(
    id: string,
    updateUsersContactCompany: updateCompanyUsersContactsDto,
  ): Promise<UsersContactUpdateCompanyResponseDto> {
    try {
      const usersContactCompany =
        await this.usersContactCompanyRepository.findOne({
          where: { id },
        });

      if (!usersContactCompany) {
        throw new HttpException(
          'Não foi localizada um contato para essa empresa',
          HttpStatus.BAD_REQUEST,
        );
      }

      const updateResult = await this.usersContactCompanyRepository.update(
        { id },
        updateUsersContactCompany,
      );

      if (updateResult.affected === 0) {
        throw new HttpException(
          'Nenhuma alteração foi realizada na subscrição',
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

  async getContactParamsUsers(
    params: ParamsUsersContactCompany,
  ): Promise<GetCompanyUsersContactsResponseDto> {
    try {
      const queryBuilder =
        this.usersContactCompanyRepository.createQueryBuilder(
          'company-users-contacts',
        );
      const { take, page } =
        this.paginationService.getDefaultPaginationParams(params);

      if (params.id) {
        queryBuilder.andWhere('company-users-contacts.id = :id', {
          id: params.id,
        });
      }


      if (params.companyId) {
        queryBuilder.andWhere('company-users-contacts.companyId = :companyId', {
          companyId: params.companyId,
        });
      }


      if (params.isActive) {
        queryBuilder.andWhere('company-users-contacts.isActive = :isActive', {
          isActive: params.isActive,
        });
      }
      if (params.name) {
        queryBuilder.andWhere(
          '(unaccent(LOWER(users_drive.name)) ILIKE unaccent(LOWER(:name)))',
          { name: `%${params.name}%` },
        );
      }

      const [result, total] = await queryBuilder
        .leftJoin('company-users-contacts.contacts', 'company')
        .leftJoin('company-users-contacts.users', 'users_drive')
        .leftJoin('users_drive.vehicles', 'vehicle')
        .leftJoin('users_drive.locations', 'location')
        .addSelect([
          'users_drive.name',
          'users_drive.photoFaceURL',
          'users_drive.phoneNumber',
          'users_drive.id',
          'vehicle.vehicleType',
          'vehicle.bodyType',
          'location.city'
  
        ])
        .skip((page - 1) * take)
        .take(take)
        .getManyAndCount();

      return {
        //@ts-ignore
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

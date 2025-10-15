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
import { UsersDrive } from '@entities/users-drive.entity';

export class UsersContactCompanyService {
  constructor(
    @InjectRepository(CompanyUsersContacts)
    private usersContactCompanyRepository: Repository<CompanyUsersContacts>,
    @InjectRepository(UsersDrive)
    private usersDriveRepository: Repository<UsersDrive>,
    private readonly paginationService: PaginationService,
  ) {}

  async createUsersContactCompany(
    createContactCompany: CompanyUsersContactsDto,
  ): Promise<CompanyUsersContactsDto> {
    try {
      const existing = await this.usersContactCompanyRepository.findOne({
        where: {
          userId: createContactCompany.userId,
          companyId: createContactCompany.companyId,
        },
      });

      if (existing) {
        existing.isActive = true;
        existing.updatedAt = new Date();
        await this.usersContactCompanyRepository.save(existing);
        return existing;
      }

      const create =
        this.usersContactCompanyRepository.create(createContactCompany);
      const save = await this.usersContactCompanyRepository.save(create);

      return save;
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao criar contato da empresa',
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
    params: ParamsUsersContactCompany & { page?: number; limit?: number },
  ): Promise<GetCompanyUsersContactsResponseDto> {
    try {
      const queryBuilder = this.usersContactCompanyRepository
        .createQueryBuilder('companyUsersContacts')
        .leftJoin('companyUsersContacts.contacts', 'company')
        .leftJoin('companyUsersContacts.users', 'users_drive')
        .leftJoinAndSelect('users_drive.reviewUserDrive', 'reviewUserDrive')
        .leftJoin('users_drive.vehicles', 'vehicle')
        .leftJoin('users_drive.locations', 'location')
        .leftJoin('users_drive.CompanyUsersContacts', 'CompanyUsersContacts')
        .addSelect([
          'users_drive.name',
          'users_drive.cpf',
          'users_drive.cnh',
          'users_drive.antt',
          'users_drive.similiary',
          'users_drive.photoFaceURL',
          'users_drive.phoneNumber',
          'users_drive.id',
          'users_drive.zipcode',
          'users_drive.isOnRoute',
          'vehicle.vehicleType',
          'vehicle.bodyType',
          'vehicle.plateState',
          'vehicle.isPlateValid',
          'vehicle.isRenavamValid',
          'vehicle.tracker',
          'vehicle.locator',
          'vehicle.plateNumber',
          'location.city',
          'location.longitude',
          'location.latitude',
          'CompanyUsersContacts.isActive',
        ]);

      if (params.id) {
        queryBuilder.andWhere('companyUsersContacts.id = :id', {
          id: params.id,
        });
      }

      if (params.companyId) {
        queryBuilder.andWhere('companyUsersContacts.companyId = :companyId', {
          companyId: params.companyId,
        });
      }

      if (params.isActive !== undefined) {
        queryBuilder.andWhere('companyUsersContacts.isActive = :isActive', {
          isActive: params.isActive,
        });
      }

      if (params.name) {
        queryBuilder.andWhere(
          '(unaccent(LOWER(users_drive.name)) ILIKE unaccent(LOWER(:name)))',
          { name: `%${params.name}%` },
        );
      }

      const allResults = await queryBuilder
        .orderBy('users_drive.name', 'ASC')
        .getMany();
      const total = allResults.length;
      const page = params.page || 1;
      const limit = params.limit || 10;
      const skip = (page - 1) * limit;

      const paginatedResults = allResults.slice(skip, skip + limit);

      return {
        //@ts-ignore
        data: paginatedResults,
        count: total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao buscar contato da empresa',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async softDeleteUsersContactCompany(id: string): Promise<string> {
    const queryRunner =
      this.usersContactCompanyRepository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const usersContactCompany = await queryRunner.manager.findOne(
        CompanyUsersContacts,
        {
          where: { id },
        },
      );

      if (!usersContactCompany) {
        throw new HttpException(
          'Não foi localizado um contato para essa empresa',
          HttpStatus.BAD_REQUEST,
        );
      }
      await queryRunner.manager.update(
        CompanyUsersContacts,
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

  async searchUsersByCpf(cpf: string, userId: string) {
    console.log('Chamando essa função com CPF:', cpf, 'e userId:', userId);
    const findUser = await this.usersDriveRepository.findOne({
      where: { cpf },
      select: {
        id: true,
        city: true,
        photoFaceURL: true,
        name: true,
        email: true,
        vehicles: true,
        phoneNumber: true,
      },
    });

    return findUser;
  }
}

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CompanyUsersContacts } from '@entities/company-users-contacts.entity';
import { ContactCompany } from '@entities/contact-company.entity';
import { Freight } from '@entities/freight.entity';
import { ContactGroup } from '@entities/contact-group.entity';
import { FreightRoutes } from '@entities/freight-routes.entity';
import { DriverDocument } from '@entities/driver-documents.entity';
import { AwsService } from '@components/aws/aws.service';
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
    @InjectRepository(ContactCompany)
    private contactCompanyRepository: Repository<ContactCompany>,
    @InjectRepository(Freight)
    private freightRepository: Repository<Freight>,
    @InjectRepository(ContactGroup)
    private contactGroupRepository: Repository<ContactGroup>,
    @InjectRepository(FreightRoutes)
    private freightRoutesRepository: Repository<FreightRoutes>,
    @InjectRepository(DriverDocument)
    private driverDocumentRepository: Repository<DriverDocument>,
    private readonly paginationService: PaginationService,
    private readonly awsService: AwsService,
    private readonly configService: ConfigService,
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

      let contactToSave: CompanyUsersContacts;

      if (existing) {
        existing.isActive = true;
        existing.updatedAt = new Date();
        contactToSave = await this.usersContactCompanyRepository.save(existing);
      } else {
        const create =
          this.usersContactCompanyRepository.create(createContactCompany);
        contactToSave = await this.usersContactCompanyRepository.save(create);
      }
      if (createContactCompany.groupIds && createContactCompany.groupIds.length > 0) {
        const groups = await this.contactGroupRepository.find({
          where: {
            id: In(createContactCompany.groupIds),
            companyId: createContactCompany.companyId,
            isActive: true,
          },
          relations: ['contacts'],
        });

        if (groups.length !== createContactCompany.groupIds.length) {
          throw new HttpException(
            'Alguns grupos não foram encontrados ou não pertencem a esta empresa',
            HttpStatus.BAD_REQUEST,
          );
        }

 
        for (const group of groups) {
          if (!group.contacts.some((c) => c.id === contactToSave.id)) {
            group.contacts.push(contactToSave);
            await this.contactGroupRepository.save(group);
          }
        }
      }

      return contactToSave;
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
        .leftJoin(
          'users_drive.locations',
          'location',
          'location.id = (SELECT id FROM users_location WHERE "userId" = users_drive.id ORDER BY "createdAt" DESC LIMIT 1)',
        )
        .leftJoin('users_drive.CompanyUsersContacts', 'CompanyUsersContacts');

      // Join com grupos se groupId for fornecido
      if (params.groupId) {
        queryBuilder
          .leftJoin(
            'contact-group-members',
            'groupMembers',
            'groupMembers.contactId = companyUsersContacts.id',
          )
          .leftJoin(
            'contact-group',
            'contactGroup',
            'contactGroup.id = groupMembers.groupId AND contactGroup.isActive = true',
          )
          .andWhere('contactGroup.id = :groupId', { groupId: params.groupId });
      }

      queryBuilder.addSelect([
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
          'users_drive.createdAt',
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

      // Buscar count de viagens para cada motorista
      const contactIds = paginatedResults.map((contact) => contact.id);
      const userIds = paginatedResults.map((contact) => contact.users?.id).filter(Boolean);
      
      let tripCounts = new Map<string, number>();
      if (userIds.length > 0) {
        const tripsData = await this.freightRoutesRepository
          .createQueryBuilder('route')
          .select('route.userDriveId', 'userDriveId')
          .addSelect('COUNT(*)', 'count')
          .where('route.userDriveId IN (:...userIds)', { userIds })
          .groupBy('route.userDriveId')
          .getRawMany();

        tripsData.forEach((data) => {
          tripCounts.set(data.userDriveId, parseInt(data.count));
        });
      }
      
      let groups = [];
      if (contactIds.length > 0) {
        groups = await this.contactGroupRepository
          .createQueryBuilder('group')
          .leftJoin('group.contacts', 'contact')
          .where('contact.id IN (:...contactIds)', { contactIds })
          .andWhere('group.isActive = :isActive', { isActive: true })
          .select(['group.id', 'group.name', 'contact.id'])
          .getMany();
      }

  
      const groupsByContactId = new Map<string, string[]>();
      for (const group of groups) {
        for (const contact of group.contacts) {
          if (!groupsByContactId.has(contact.id)) {
            groupsByContactId.set(contact.id, []);
          }
          groupsByContactId.get(contact.id).push(group.name);
        }
      }

      // Adicionar grupos e count de viagens aos resultados
      const resultsWithGroups = paginatedResults.map((contact) => ({
        ...contact,
        groups: groupsByContactId.get(contact.id) || [],
        tripCount: tripCounts.get(contact.users?.id) || 0,
      }));

      return {
        //@ts-ignore
        data: resultsWithGroups,
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

  async getContactCompanyInfo(contactId: string) {
    try {
      const contactCompany = await this.contactCompanyRepository.findOne({
        where: { id: contactId },
        relations: ['company'],
        select: {
          id: true,
          name: true,
          password: true,
          phoneNumber: true,
          company: {
            id: true,
            name: true,
            nameFantasy: true,
            photoUrl: true,
          },
        },
      });

      if (!contactCompany) {
        throw new HttpException(
          'Contato da empresa não encontrado',
          HttpStatus.NOT_FOUND,
        );
      }

      const hasPassword = !!contactCompany.password;

      if (hasPassword) {
        return { register: true };
      }

      const freights = await this.freightRepository.find({
        where: { companyId: contactCompany.company.id },
        order: { createdAt: 'DESC' },
        take: 15,
        select: {
          id: true,
          originCity: true,
          destinyCity: true,
          originState: true,
          destinyState: true,
          Valuefreight: true,
          createdAt: true,
          isActive: true,
          openSolicitations: true,
        },
      });

      return {
        register: false,
        contactName: contactCompany.name,
        companyName:
          contactCompany.company.name || contactCompany.company.nameFantasy,
        phoneNumber: contactCompany.phoneNumber,
        photoUrl: contactCompany.company.photoUrl,
        freights: freights,
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao buscar informações do contato da empresa',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ───────────────────────── DOCUMENTOS DO MOTORISTA ─────────────────────────

  async uploadDriverDocument(
    companyId: string,
    driverId: string,
    file: Express.Multer.File,
    description?: string,
  ): Promise<DriverDocument> {
    try {
     
      const contact = await this.usersContactCompanyRepository.findOne({
        where: { companyId, userId: driverId, isActive: true },
      });
      if (!contact) {
        throw new HttpException(
          'Motorista não encontrado na empresa',
          HttpStatus.NOT_FOUND,
        );
      }

      const bucket = this.configService.get<string>('AWS_S3_BUCKET_NAME');
      const ext = file.originalname.split('.').pop();
      const fileKey = `driver-documents/${companyId}/${driverId}/${Date.now()}.${ext}`;

      const fileUrl = await this.awsService.uploadDocument(
        bucket,
        fileKey,
        file.buffer,
        file.mimetype,
      );

      const doc = this.driverDocumentRepository.create({
        companyId,
        userId: driverId,
        fileName: file.originalname,
        fileKey,
        fileUrl,
        mimeType: file.mimetype,
        fileSizeBytes: file.size,
        description: description ?? null,
        isActive: true,
      });

      return this.driverDocumentRepository.save(doc);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error?.message || 'Erro ao fazer upload do documento',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async listDriverDocuments(
    companyId: string,
    driverId: string,
  ): Promise<DriverDocument[]> {
    try {
      return this.driverDocumentRepository.find({
        where: { companyId, userId: driverId, isActive: true },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao listar documentos',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteDriverDocument(
    companyId: string,
    documentId: string,
  ): Promise<{ message: string }> {
    try {
      const doc = await this.driverDocumentRepository.findOne({
        where: { id: documentId, companyId, isActive: true },
      });
      if (!doc) {
        throw new HttpException('Documento não encontrado', HttpStatus.NOT_FOUND);
      }

      doc.isActive = false;
      await this.driverDocumentRepository.save(doc);

      return { message: 'Documento removido com sucesso' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error?.message || 'Erro ao remover documento',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

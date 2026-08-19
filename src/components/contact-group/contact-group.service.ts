import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ContactGroup } from '@entities/contact-group.entity';
import { CompanyUsersContacts } from '@entities/company-users-contacts.entity';
import {
  CreateContactGroupDto,
  UpdateContactGroupDto,
  AddContactsToGroupDto,
  RemoveContactsFromGroupDto,
  MoveContactsToGroupDto,
} from './dto/contact-group.dto';
import {
  ContactGroupResponseDto,
  ContactGroupUpdateResponseDto,
  GetContactGroupsResponseDto,
} from './dto/response-contact-group.dto';

@Injectable()
export class ContactGroupService {
  constructor(
    @InjectRepository(ContactGroup)
    private contactGroupRepository: Repository<ContactGroup>,
    @InjectRepository(CompanyUsersContacts)
    private companyUsersContactsRepository: Repository<CompanyUsersContacts>,
  ) {}

  async createGroup(
    dto: CreateContactGroupDto,
    companyId: string,
  ): Promise<ContactGroupResponseDto> {
    try {
      const group = this.contactGroupRepository.create({
        name: dto.name,
        companyId,
      });

      if (dto.contactIds && dto.contactIds.length > 0) {
        const contacts = await this.companyUsersContactsRepository.find({
          where: {
            id: In(dto.contactIds),
            companyId,
          },
        });

        if (contacts.length !== dto.contactIds.length) {
          throw new HttpException(
            'Alguns contatos não foram encontrados ou não pertencem a esta empresa',
            HttpStatus.BAD_REQUEST,
          );
        }

        group.contacts = contacts;
      }

      const savedGroup = await this.contactGroupRepository.save(group);

      return this.contactGroupRepository.findOne({
        where: { id: savedGroup.id },
        relations: ['contacts', 'contacts.users'],
      });
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao criar grupo',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateGroup(
    groupId: string,
    dto: UpdateContactGroupDto,
    companyId: string,
  ): Promise<ContactGroupUpdateResponseDto> {
    try {
      const group = await this.contactGroupRepository.findOne({
        where: { id: groupId, companyId },
      });

      if (!group) {
        throw new HttpException(
          'Grupo não encontrado ou você não tem permissão para alterá-lo',
          HttpStatus.BAD_REQUEST,
        );
      }

      const updateResult = await this.contactGroupRepository.update(
        { id: groupId },
        { name: dto.name },
      );

      if (updateResult.affected === 0) {
        throw new HttpException(
          'Nenhuma alteração foi realizada',
          HttpStatus.BAD_REQUEST,
        );
      }

      return {
        message: 'Grupo atualizado com sucesso',
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao atualizar grupo',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteGroup(
    groupId: string,
    companyId: string,
  ): Promise<ContactGroupUpdateResponseDto> {
    try {
      const group = await this.contactGroupRepository.findOne({
        where: { id: groupId, companyId },
      });

      if (!group) {
        throw new HttpException(
          'Grupo não encontrado ou você não tem permissão para excluí-lo',
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.contactGroupRepository.update(
        { id: groupId },
        { isActive: false },
      );

      return {
        message: 'Grupo excluído com sucesso',
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao excluir grupo',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async addContactsToGroup(
    groupId: string,
    dto: AddContactsToGroupDto,
    companyId: string,
  ): Promise<ContactGroupUpdateResponseDto> {
    try {
      const group = await this.contactGroupRepository.findOne({
        where: { id: groupId, companyId },
        relations: ['contacts'],
      });

      if (!group) {
        throw new HttpException(
          'Grupo não encontrado ou você não tem permissão',
          HttpStatus.BAD_REQUEST,
        );
      }

      const contacts = await this.companyUsersContactsRepository.find({
        where: {
          id: In(dto.contactIds),
          companyId,
        },
      });

      if (contacts.length !== dto.contactIds.length) {
        throw new HttpException(
          'Alguns contatos não foram encontrados ou não pertencem a esta empresa',
          HttpStatus.BAD_REQUEST,
        );
      }

      const existingContactIds = group.contacts.map((c) => c.id);
      const newContacts = contacts.filter(
        (c) => !existingContactIds.includes(c.id),
      );

      group.contacts = [...group.contacts, ...newContacts];
      await this.contactGroupRepository.save(group);

      return {
        message: 'Contatos adicionados ao grupo com sucesso',
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao adicionar contatos ao grupo',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async removeContactsFromGroup(
    groupId: string,
    dto: RemoveContactsFromGroupDto,
    companyId: string,
  ): Promise<ContactGroupUpdateResponseDto> {
    try {
      const group = await this.contactGroupRepository.findOne({
        where: { id: groupId, companyId },
        relations: ['contacts'],
      });

      if (!group) {
        throw new HttpException(
          'Grupo não encontrado ou você não tem permissão',
          HttpStatus.BAD_REQUEST,
        );
      }

      group.contacts = group.contacts.filter(
        (c) => !dto.contactIds.includes(c.id),
      );

      await this.contactGroupRepository.save(group);

      return {
        message: 'Contatos removidos do grupo com sucesso',
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao remover contatos do grupo',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async moveContactsToGroup(
    sourceGroupId: string,
    dto: MoveContactsToGroupDto,
    companyId: string,
  ): Promise<ContactGroupUpdateResponseDto> {
    try {
      const [sourceGroup, targetGroup] = await Promise.all([
        this.contactGroupRepository.findOne({
          where: { id: sourceGroupId, companyId },
          relations: ['contacts'],
        }),
        this.contactGroupRepository.findOne({
          where: { id: dto.targetGroupId, companyId },
          relations: ['contacts'],
        }),
      ]);

      if (!sourceGroup || !targetGroup) {
        throw new HttpException(
          'Grupo de origem ou destino não encontrado',
          HttpStatus.BAD_REQUEST,
        );
      }

      const contactsToMove = sourceGroup.contacts.filter((c) =>
        dto.contactIds.includes(c.id),
      );

      if (contactsToMove.length !== dto.contactIds.length) {
        throw new HttpException(
          'Alguns contatos não foram encontrados no grupo de origem',
          HttpStatus.BAD_REQUEST,
        );
      }

      sourceGroup.contacts = sourceGroup.contacts.filter(
        (c) => !dto.contactIds.includes(c.id),
      );

      const targetContactIds = targetGroup.contacts.map((c) => c.id);
      const newContacts = contactsToMove.filter(
        (c) => !targetContactIds.includes(c.id),
      );
      targetGroup.contacts = [...targetGroup.contacts, ...newContacts];

      await Promise.all([
        this.contactGroupRepository.save(sourceGroup),
        this.contactGroupRepository.save(targetGroup),
      ]);

      return {
        message: 'Contatos movidos para o novo grupo com sucesso',
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao mover contatos entre grupos',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getGroupsByCompany(
    companyId: string,
  ): Promise<GetContactGroupsResponseDto> {
    try {
      const [groups, count] = await this.contactGroupRepository.findAndCount({
        where: { companyId, isActive: true },
        relations: ['contacts', 'contacts.users'],
        order: { createdAt: 'DESC' },
      });

      return {
        data: groups,
        count,
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao buscar grupos',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getGroupById(
    groupId: string,
    companyId: string,
  ): Promise<ContactGroupResponseDto> {
    try {
      const group = await this.contactGroupRepository.findOne({
        where: { id: groupId, companyId, isActive: true },
        relations: ['contacts', 'contacts.users'],
      });

      if (!group) {
        throw new HttpException(
          'Grupo não encontrado ou você não tem permissão para acessá-lo',
          HttpStatus.NOT_FOUND,
        );
      }

      return group;
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao buscar grupo',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

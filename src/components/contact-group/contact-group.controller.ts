import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ContactGroupService } from './contact-group.service';
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
import { JwtAuthGuard } from 'src/guards/jwt-auth-guard';
import { GetUserId } from 'src/decorators/get-user-decorator';

@ApiTags('contact-group')
@Controller('contact-group')
@UseGuards(JwtAuthGuard)
export class ContactGroupController {
  constructor(private readonly contactGroupService: ContactGroupService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo grupo de contatos' })
  @ApiResponse({
    status: 201,
    description: 'Grupo criado com sucesso',
    type: ContactGroupResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao criar grupo',
  })
  async createGroup(
    @Body() dto: CreateContactGroupDto,
    @GetUserId() companyId: string,
  ): Promise<ContactGroupResponseDto> {
    return this.contactGroupService.createGroup(dto, companyId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os grupos da empresa' })
  @ApiResponse({
    status: 200,
    description: 'Grupos recuperados com sucesso',
    type: GetContactGroupsResponseDto,
  })
  async getGroups(
    @GetUserId() companyId: string,
  ): Promise<GetContactGroupsResponseDto> {
    return this.contactGroupService.getGroupsByCompany(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar grupo específico por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID do grupo',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Grupo encontrado',
    type: ContactGroupResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Grupo não encontrado',
  })
  async getGroupById(
    @Param('id') groupId: string,
    @GetUserId() companyId: string,
  ): Promise<ContactGroupResponseDto> {
    return this.contactGroupService.getGroupById(groupId, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar nome do grupo' })
  @ApiParam({
    name: 'id',
    description: 'ID do grupo',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Grupo atualizado com sucesso',
    type: ContactGroupUpdateResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao atualizar grupo',
  })
  async updateGroup(
    @Param('id') groupId: string,
    @Body() dto: UpdateContactGroupDto,
    @GetUserId() companyId: string,
  ): Promise<ContactGroupUpdateResponseDto> {
    return this.contactGroupService.updateGroup(groupId, dto, companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir grupo (soft delete)' })
  @ApiParam({
    name: 'id',
    description: 'ID do grupo',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Grupo excluído com sucesso',
    type: ContactGroupUpdateResponseDto,
  })
  async deleteGroup(
    @Param('id') groupId: string,
    @GetUserId() companyId: string,
  ): Promise<ContactGroupUpdateResponseDto> {
    return this.contactGroupService.deleteGroup(groupId, companyId);
  }

  @Post(':id/contacts')
  @ApiOperation({ summary: 'Adicionar contatos ao grupo' })
  @ApiParam({
    name: 'id',
    description: 'ID do grupo',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Contatos adicionados com sucesso',
    type: ContactGroupUpdateResponseDto,
  })
  async addContacts(
    @Param('id') groupId: string,
    @Body() dto: AddContactsToGroupDto,
    @GetUserId() companyId: string,
  ): Promise<ContactGroupUpdateResponseDto> {
    return this.contactGroupService.addContactsToGroup(groupId, dto, companyId);
  }

  @Delete(':id/contacts')
  @ApiOperation({ summary: 'Remover contatos do grupo' })
  @ApiParam({
    name: 'id',
    description: 'ID do grupo',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Contatos removidos com sucesso',
    type: ContactGroupUpdateResponseDto,
  })
  async removeContacts(
    @Param('id') groupId: string,
    @Body() dto: RemoveContactsFromGroupDto,
    @GetUserId() companyId: string,
  ): Promise<ContactGroupUpdateResponseDto> {
    return this.contactGroupService.removeContactsFromGroup(
      groupId,
      dto,
      companyId,
    );
  }

  @Post(':id/move-contacts')
  @ApiOperation({ summary: 'Mover contatos para outro grupo' })
  @ApiParam({
    name: 'id',
    description: 'ID do grupo de origem',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Contatos movidos com sucesso',
    type: ContactGroupUpdateResponseDto,
  })
  async moveContacts(
    @Param('id') sourceGroupId: string,
    @Body() dto: MoveContactsToGroupDto,
    @GetUserId() companyId: string,
  ): Promise<ContactGroupUpdateResponseDto> {
    return this.contactGroupService.moveContactsToGroup(
      sourceGroupId,
      dto,
      companyId,
    );
  }
}

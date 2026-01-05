import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { UsersDrive } from '../../entities/users-drive.entity';
import {
  NFRETES_GROUP_ID_NORTE,
  NFRETES_GROUP_ID_CENTRO_OESTE,
  NFRETES_GROUP_ID_NORDESTE,
  NFRETES_GROUP_ID_SUDESTE,
  NFRETES_GROUP_ID_SUL,
} from './group';

export interface ZApiGroup {
  phone: string;
  name: string;
  participants: string[];
  admins: string[];
  imageUrl?: string;
}

export interface ZApiGroupsResponse {
  groups: ZApiGroup[];
}

export interface AddParticipantDto {
  groupPhone: string;
  phone: string[];
}

export interface ZApiAddParticipantResponse {
  value: boolean;
  message?: string;
}

export interface AddUsersToGroupsResponse {
  total: number;
  norte: { count: number; groupId: string };
  centroOeste: { count: number; groupId: string };
  nordeste: { count: number; groupId: string };
  sudeste: { count: number; groupId: string };
  sul: { count: number; groupId: string };
  errors: string[];
}

@Injectable()
export class FretebrasService {
  private readonly logger = new Logger(FretebrasService.name);
  private readonly baseUrl = 'https://api.z-api.io';
  private readonly instanceId = '3EBD760D4EA87252D76786079C760A11';
  private readonly instanceToken = '8E7A649870C37DAEFC3E5232';
  private readonly clientToken = 'Fed31b7b6d90b49c680e7f6fb03ca012fS'
  
  private readonly BATCH_SIZE = 50;
  private readonly DELAY_BETWEEN_BATCHES = 2000;
  
  private readonly dddMap = {
    NORTE: ['63', '68', '69', '91', '92', '93', '94', '95', '96', '97'],
    CENTRO_OESTE: ['61', '62', '64', '65', '66', '67'],
    NORDESTE: ['71', '73', '74', '75', '77', '79', '81', '82', '83', '84', '85', '86', '87', '88', '89', '98', '99'],
    SUDESTE: ['11', '12', '13', '14', '15', '16', '17', '18', '19', '21', '22', '24', '27', '28', '31', '32', '33', '34', '35', '37', '38'],
    SUL: ['41', '42', '43', '44', '45', '46', '47', '48', '49', '51', '53', '54', '55'],
  };

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(UsersDrive)
    private readonly usersDriveRepository: Repository<UsersDrive>,
  ) {}


  async getGroups(): Promise<ZApiGroupsResponse> {
    try {
      const url = `${this.baseUrl}/instances/${this.instanceId}/token/${this.instanceToken}/groups?page=1&pageSize=10`;

      this.logger.log(`Buscando grupos do WhatsApp`);

      const response = await firstValueFrom(
        this.httpService.get<ZApiGroupsResponse>(url, {
          headers: {
            'Content-Type': 'application/json',
            "client-token": this.clientToken,
          },
        }),
      );

      this.logger.log(`${response.data.groups?.length || 0} grupos encontrados`);

      return response.data;
    } catch (error) {
      this.logger.error('Erro ao buscar grupos:', error.response?.data || error.message);
      throw new Error(`Falha ao buscar grupos: ${error.message}`);
    }
  }

  async addParticipantToGroup(
    groupPhone: string,
    phones: string[],
  ): Promise<ZApiAddParticipantResponse> {
    try {
      const url = `${this.baseUrl}/instances/${this.instanceId}/token/${this.instanceToken}/add-participant`;

      this.logger.log(
        `Adicionando ${phones.length} participante(s) ao grupo ${groupPhone}`,
      );

      const payload = {
        autoInvite: true,
        groupId: groupPhone,
        phones: phones,
      };

      this.logger.debug(`Payload: ${JSON.stringify(payload)}`);

      const response = await firstValueFrom(
        this.httpService.post<ZApiAddParticipantResponse>(
          url,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
               "client-token": this.clientToken,
            },
          },
        ),
      );

      this.logger.log(
        `Participantes adicionados com sucesso ao grupo ${groupPhone}`,
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `Erro ao adicionar participantes ao grupo ${groupPhone}:`,
        JSON.stringify(error.response?.data) || error.message,
      );
      throw new Error(
        `Falha ao adicionar participantes: ${JSON.stringify(error.response?.data) || error.message}`,
      );
    }
  }

  async getGroupInfo(groupPhone: string): Promise<ZApiGroup | null> {
    try {
      const groups = await this.getGroups();
      return groups.groups.find((group) => group.phone === groupPhone) || null;
    } catch (error) {
      this.logger.error(
        `Erro ao buscar informações do grupo ${groupPhone}:`,
        error.message,
      );
      throw error;
    }
  }



  private extractDDD(phoneNumber: string): string | null {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      return cleaned.substring(0, 2);
    }
    return null;
  }

  private formatPhoneNumber(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.startsWith('55')) {
      return cleaned;
    }
    return `55${cleaned}`;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private getRegionByDDD(ddd: string): string | null {
    if (!ddd) return null;
    for (const [region, ddds] of Object.entries(this.dddMap)) {
      if (ddds.includes(ddd)) {
        return region;
      }
    }
    return null;
  }

  private getGroupIdByRegion(region: string): string {
    const groupMap = {
      NORTE: NFRETES_GROUP_ID_NORTE,
      CENTRO_OESTE: NFRETES_GROUP_ID_CENTRO_OESTE,
      NORDESTE: NFRETES_GROUP_ID_NORDESTE,
      SUDESTE: NFRETES_GROUP_ID_SUDESTE,
      SUL: NFRETES_GROUP_ID_SUL,
    };
    return groupMap[region];
  }

  async addUsersToGroupsByRegion(): Promise<AddUsersToGroupsResponse> {
    const errors: string[] = [];
    const regionUsers = {
      NORTE: [],
      CENTRO_OESTE: [],
      NORDESTE: [],
      SUDESTE: [],
      SUL: [],
    };

    try {
      const users = await this.usersDriveRepository.find({
        where: { phoneNumber: Not(IsNull()) },
        select: ['id', 'name', 'phoneNumber'],
      });

      this.logger.log(`Total de usuários encontrados: ${users.length}`);

      for (const user of users) {
        if (!user.phoneNumber) continue;

        const ddd = this.extractDDD(user.phoneNumber);
        if (!ddd) {
          errors.push(`Usuário ${user.name} (${user.id}): Não foi possível extrair DDD do telefone "${user.phoneNumber}"`);
          continue;
        }

        const region = this.getRegionByDDD(ddd);
        if (!region) {
          errors.push(`Usuário ${user.name} (${user.id}): DDD "${ddd}" não mapeado`);
          continue;
        }

        const formattedPhone = this.formatPhoneNumber(user.phoneNumber);
        regionUsers[region].push(formattedPhone);
      }

      const results = {
        norte: { count: 0, groupId: NFRETES_GROUP_ID_NORTE },
        centroOeste: { count: 0, groupId: NFRETES_GROUP_ID_CENTRO_OESTE },
        nordeste: { count: 0, groupId: NFRETES_GROUP_ID_NORDESTE },
        sudeste: { count: 0, groupId: NFRETES_GROUP_ID_SUDESTE },
        sul: { count: 0, groupId: NFRETES_GROUP_ID_SUL },
      };

      for (const [region, phones] of Object.entries(regionUsers)) {
        if (phones.length === 0) continue;

        const groupId = this.getGroupIdByRegion(region);
        const batches = this.chunkArray(phones, this.BATCH_SIZE);
        
        this.logger.log(`Região ${region}: ${phones.length} usuários divididos em ${batches.length} lotes`);

        let successCount = 0;
        let batchNumber = 0;

        for (const batch of batches) {
          batchNumber++;
          try {
            this.logger.log(`Processando lote ${batchNumber}/${batches.length} da região ${region} (${batch.length} números)`);
            await this.addParticipantToGroup(groupId, batch);
            successCount += batch.length;
            this.logger.log(`Lote ${batchNumber}/${batches.length} da região ${region} adicionado com sucesso`);
            
            if (batchNumber < batches.length) {
              await this.delay(this.DELAY_BETWEEN_BATCHES);
            }
          } catch (error) {
            errors.push(`Erro no lote ${batchNumber} da região ${region}: ${error.message}`);
            this.logger.error(`Erro no lote ${batchNumber} da região ${region}:`, error.message);
          }
        }

        const regionKey = region === 'CENTRO_OESTE' ? 'centroOeste' : region.toLowerCase();
        results[regionKey].count = successCount;
        this.logger.log(`Região ${region}: ${successCount}/${phones.length} usuários adicionados com sucesso`);
      }

      return {
        total: users.length,
        ...results,
        errors,
      };
    } catch (error) {
      this.logger.error('Erro ao processar usuários:', error.message);
      throw new Error(`Falha ao adicionar usuários aos grupos: ${error.message}`);
    }
  }
}

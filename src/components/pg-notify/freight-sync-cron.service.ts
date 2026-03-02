import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Client } from 'pg';
import { Freight } from '../../entities/freight.entity';
import { Company } from '../../entities/company.entity';
import { ContactCompany } from '../../entities/contact-company.entity';
import { VehicleType, BodyType } from '../../enum/vehicle';
import {
  PaymentMethod,
  UnityMetric,
  SpecieOfLoad,
  Toll,
} from '../../enum/freight';
import { FretebrasService } from '../fretebras/fretebras.service';
import {
  NFRETES_GROUP_ID_NORTE,
  NFRETES_GROUP_ID_CENTRO_OESTE,
  NFRETES_GROUP_ID_NORDESTE,
  NFRETES_GROUP_ID_SUDESTE,
  NFRETES_GROUP_ID_SUL,
} from '../fretebras/group';

@Injectable()
export class FreightSyncCronService {
  private readonly logger = new Logger(FreightSyncCronService.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(Freight)
    private freightRepository: Repository<Freight>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(ContactCompany)
    private contactCompanyRepository: Repository<ContactCompany>,
    private fretebrasService: FretebrasService,
  ) {
    this.logger.log('✅ FreightSyncCronService inicializado (sem conexão Fretebras)');
  }

  /**
   * Converter tipo de veículo para português
   */
  private convertVehicleType(vehicleType: string): string {
    const vehicleTypeLabelMap: Record<string, string> = {
      'ALLLIGHT': 'Todos Leves',
      'ALLAVERAGE': 'Todos Médios',
      'TRAINWHELL': 'Roda de Trem',
      'THREE_QUARTER': 'Três Quartos',
      'FIORINO': 'Fiorino',
      'STUMP': 'Tronco',
      'VCL': 'VCL',
      'BIT_TRUCK': 'Bitruck',
      'TRUCK': 'Caminhão',
      'BI_TRAIN': 'Bi-Trem',
      'CART': 'Carroça',
      'CART_LS': 'Carroça LS',
      'ROAD_TRAIN': 'Road Train',
      'VANDERLEIA': 'Vanderleia',
      'THREE_FOUR': 'Três Quatro',
      'TOCO': 'Toco',
      'ALLWEIGHT': 'Todos Pesados',
    };
    return vehicleTypeLabelMap[vehicleType] ?? vehicleType;
  }

  /**
   * Converter tipo de carroceria para português
   */
  private convertBodyType(bodyType: string): string {
    const bodyTypeLabelMap: Record<string, string> = {
      'CHEST': 'Baú',
      'FRIDGE_CHEST': 'Baú Frigorífico',
      'REFRIGERATED_CHEST': 'Baú Refrigerado',
      'SIDER': 'Sider',
      'BUCKET': 'Caçamba',
      'LOW_GRILLE': 'Grade Baixa',
      'BULK_CARRIER': 'Graneleiro',
      'PLATFORM': 'Plataforma',
      'BOARD': 'Plataforma de Madeira',
      'ONLY_HORSE': 'Somente Cavalo',
      'BUG_CONTAINER_DOOR': 'Porta de Container',
      'PRATTLE': 'Pau de Arara',
      'BLINKER': 'Pisca',
      'CAVAQUEIRA': 'Cavaqueira',
      'CAGE': 'Gaiola',
      'CONTAINER': 'Container',
      'HOPPER': 'Hopper',
      'MUNK': 'Munk',
      'SILO': 'Silo',
      'TANK': 'Tanque',
    };
    return bodyTypeLabelMap[bodyType] ?? bodyType;
  }

  /**
   * Cron job que roda a cada 10 minutos
   * Busca fretes novos no banco local que ainda não foram compartilhados
   * e envia notificações agrupadas por região no WhatsApp
   */
  @Cron('*/10 * * * *', {
    name: 'freight-sync',
    timeZone: 'America/Sao_Paulo',
  })
  async syncFreightsFromToday() {
    this.logger.log('🔄 Iniciando sincronização periódica de fretes...');

    try {

      const freightsToShare = await this.freightRepository.find({
        where: {
          isToShare: true,
          openSolicitations: true,
          isActive: true,
        },
        relations: ['company'],
        order: {
          createdAt: 'DESC',
        },
      });

      this.logger.log(
        `📦 Encontrados ${freightsToShare.length} fretes para compartilhar`,
      );

      if (freightsToShare.length === 0) {
        this.logger.log('✅ Nenhum frete para compartilhar');
        return;
      }

      const freightsByRegion = this.groupLocalFreightsByRegion(freightsToShare);
      let sharedCount = 0;
      let errorCount = 0;

      for (const [region, freights] of Object.entries(freightsByRegion)) {
        if (Array.isArray(freights) && freights.length > 0) {
          this.logger.log(
            `📍 Compartilhando ${freights.length} fretes da região ${region}`,
          );

          try {
            await this.sendGroupedNotificationsWithUpdate(freights, region);
            sharedCount += freights.length;

    
            const freightIds = freights.map((f) => f.id);
            await this.freightRepository.update(
              { id: In(freightIds) },
              { isToShare: false },
            );

            this.logger.log(
              `✅ ${freights.length} fretes compartilhados e marcados (${region})`,
            );
          } catch (error) {
            errorCount += freights.length;
            this.logger.error(
              `❌ Erro ao compartilhar fretes da região ${region}:`,
              error.message || error,
            );
          }
        }
      }

      this.logger.log(
        `🎉 Sincronização concluída! ` +
          `Total encontrados: ${freightsToShare.length} | ` +
          `Compartilhados: ${sharedCount} | ` +
          `Erros: ${errorCount}`,
      );
    } catch (error) {
      this.logger.error(
        '❌ Erro durante sincronização de fretes:',
        error.message || error,
      );
    }
  }

  private groupLocalFreightsByRegion(freights: Freight[]) {
    const regions = {
      NORTE: [],
      NORDESTE: [],
      CENTRO_OESTE: [],
      SUDESTE: [],
      SUL: [],
    };

    // Mapa de estados para regiões
    const stateToRegion = {
      AC: 'NORTE',
      AP: 'NORTE',
      AM: 'NORTE',
      PA: 'NORTE',
      RO: 'NORTE',
      RR: 'NORTE',
      TO: 'NORTE',
      AL: 'NORDESTE',
      BA: 'NORDESTE',
      CE: 'NORDESTE',
      MA: 'NORDESTE',
      PB: 'NORDESTE',
      PE: 'NORDESTE',
      PI: 'NORDESTE',
      RN: 'NORDESTE',
      SE: 'NORDESTE',
      DF: 'CENTRO_OESTE',
      GO: 'CENTRO_OESTE',
      MT: 'CENTRO_OESTE',
      MS: 'CENTRO_OESTE',
      ES: 'SUDESTE',
      MG: 'SUDESTE',
      RJ: 'SUDESTE',
      SP: 'SUDESTE',
      PR: 'SUL',
      RS: 'SUL',
      SC: 'SUL',
    };

    // Agrupar por região baseado no estado de origem
    for (const freight of freights) {
      const originState = freight.originState?.toUpperCase();
      const region = stateToRegion[originState] || 'SUDESTE'; // Default SUDESTE

      if (regions[region]) {
        regions[region].push(freight);
      }
    }

    // Limitar a 10 fretes por região
    Object.keys(regions).forEach((region) => {
      const total = regions[region].length;
      regions[region] = regions[region].slice(0, 10);
      if (total > 0) {
        this.logger.log(
          `📊 Região ${region}: ${total} fretes, compartilhando ${regions[region].length}`,
        );
      }
    });

    return regions;
  }

  private async sendGroupedNotificationsWithUpdate(
    freights: Freight[],
    region: string,
  ) {
    const regionGroupMap = {
      NORTE: { id: NFRETES_GROUP_ID_NORTE, name: 'Norte' },
      NORDESTE: { id: NFRETES_GROUP_ID_NORDESTE, name: 'Nordeste' },
      CENTRO_OESTE: { id: NFRETES_GROUP_ID_CENTRO_OESTE, name: 'Centro-Oeste' },
      SUDESTE: { id: NFRETES_GROUP_ID_SUDESTE, name: 'Sudeste' },
      SUL: { id: NFRETES_GROUP_ID_SUL, name: 'Sul' },
    };

    const groupInfo = regionGroupMap[region];
    if (!groupInfo || !groupInfo.id) {
      this.logger.warn(`Grupo não configurado para região: ${region}`);
      return;
    }

    try {
      const message = this.formatLocalFreightMessage(freights, groupInfo.name);
      await this.fretebrasService.sendTextMessage(groupInfo.id, message);
      this.logger.log(
        `✅ Enviados ${freights.length} fretes para região ${region}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Erro ao enviar mensagem para região ${region}:`,
        error,
      );
      throw error;
    }
  }

  private formatLocalFreightMessage(
    freights: Freight[],
    regionName: string,
  ): string {
    let message = `🚛 *Novos Fretes Disponíveis - Região ${regionName}!*\n\n`;

    freights.forEach((freight, index) => {
      const origem =
        freight.originCity && freight.originState
          ? `${freight.originCity}/${freight.originState}`
          : 'Origem não informada';

      const destino =
        freight.destinyCity && freight.destinyState
          ? `${freight.destinyCity}/${freight.destinyState}`
          : 'Destino não informado';

      const tipoCarga = freight.product || 'Não informada';
      
      // Traduzir e formatar tipos de veículos
      const veiculo = freight.vehicleTypes?.length 
        ? freight.vehicleTypes
            .map(v => this.convertVehicleType(v))
            .join(', ')
        : 'Não informado';
      
      // Traduzir e formatar tipos de carroceria
      const carroceria = freight.bodyTypes?.length 
        ? freight.bodyTypes
            .map(b => this.convertBodyType(b))
            .join(', ')
        : 'Não informada';
      
      const peso = freight.weightOfLoad || 'Não informado';
      const especie = freight.specieOfLoad || '';
      const distancia = freight.distance ? `${freight.distance} km` : null;
      
      // Valor: mostrar "A combinar" se for 0 ou null
      const valor = freight.Valuefreight && freight.Valuefreight > 0 
        ? `R$ ${freight.Valuefreight.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : 'A combinar';

      // Adiantamento
      const adiantamento = freight.valueAdvance && freight.valueAdvance > 0
        ? `R$ ${freight.valueAdvance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : 'Não informado';

      // Pedágio
      const pedagio = freight.Toll || 'Não informado';

      // Formatar data e hora
      let dataHora = '';
      if (freight.createdAt) {
        const date = new Date(freight.createdAt);
        const dia = date.getDate().toString().padStart(2, '0');
        const mes = (date.getMonth() + 1).toString().padStart(2, '0');
        const ano = date.getFullYear();
        const hora = date.getHours().toString().padStart(2, '0');
        const minuto = date.getMinutes().toString().padStart(2, '0');
        dataHora = `${dia}/${mes}/${ano} às ${hora}:${minuto}`;
      }

      // Nome da transportadora
      const transportadora =
        freight.company?.name ||
        freight.company?.nameFantasy ||
        'Transportadora';

      // URL do frete
      const freightUrl = `https://nfretes.com.br/detalhes-do-frete/${freight.id}/`;

      message += `━━━━━━━━━━━━━━━━━━━━\n`;
      message += `🚛 *Frete ${index + 1}* ${dataHora ? `(${dataHora})` : ''}\n`;
      message += `🏢 *Empresa:* ${transportadora}\n\n`;
      
      message += `📍 *Rota:* ${origem} ➡️ ${destino}\n`;
      if (distancia) {
        message += `📏 *Distância:* ${distancia}\n`;
      }
      
      message += `\n📦 *DETALHES DA CARGA*\n`;
      message += `• *Produto:* ${tipoCarga}\n`;
      message += `• *Peso:* ${peso}${especie ? ` (${especie})` : ''}\n`;
      message += `• *Veículo:* ${veiculo}\n`;
      message += `• *Carroceria:* ${carroceria}\n`;
      
      message += `\n💰 *VALORES*\n`;
      message += `• *Valor do Frete:* ${valor}\n`;
      message += `• *Adiantamento:* ${adiantamento}\n`;
      message += `• *Pedágio:* ${pedagio}\n`;
      
      message += `\n🔗 *Ver detalhes:* ${freightUrl}\n\n`;
    });

    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `💡 *Como aceitar estes fretes:*\n`;
    message += `1️⃣ Clique no link acima de cada frete\n`;
    message += `2️⃣ Baixe o app nFretes Motorista\n`;
    message += `3️⃣ Procure pela origem do frete\n`;
    message += `4️⃣ Envie seu convite!\n\n`;
    message += `_Fretes disponíveis! Não perca essa oportunidade! 🚚💨_`;

    return message;
  }

  /**
   * Método para sincronizar manualmente (útil para testes)
   */
  async syncManually() {
    this.logger.log('🔧 Sincronização manual solicitada');
    return this.syncFreightsFromToday();
  }

  async onModuleDestroy() {
    this.logger.log('🔌 FreightSyncCronService encerrado');
  }

  // ======================================================================
  // MÉTODOS LEGADOS - Mantidos para compatibilidade futura com FreteBras
  // ======================================================================

  private groupNewFreightsByRegion(freights: any[]) {
    const regions = {
      NORTE: [],
      NORDESTE: [],
      CENTRO_OESTE: [],
      SUDESTE: [],
      SUL: [],
    };

    // Agrupar por região
    for (const freightData of freights) {
      const region = this.fretebrasService.getRegionFromFreight(freightData);
      if (region && regions[region]) {
        regions[region].push(freightData);
      }
    }

    // Limitar a 10 fretes por região
    Object.keys(regions).forEach((region) => {
      const total = regions[region].length;
      regions[region] = regions[region].slice(0, 10);
      if (total > 0) {
        this.logger.log(
          `📊 Região ${region}: ${total} novos, processando ${regions[region].length}`,
        );
      }
    });

    return regions;
  }

  private groupFreightsByRegion(
    freights: Array<{ freight: Freight; data: any }>,
  ) {
    const regions = {
      NORTE: [],
      NORDESTE: [],
      CENTRO_OESTE: [],
      SUDESTE: [],
      SUL: [],
    };

    for (const item of freights) {
      const region = this.fretebrasService.getRegionFromFreight(item.data);
      if (region && regions[region]) {
        regions[region].push(item.data);
      }
    }

    // Limitar a 10 fretes por região
    Object.keys(regions).forEach((region) => {
      regions[region] = regions[region].slice(0, 10);
    });

    return regions;
  }

  private async sendGroupedNotifications(freightsByRegion: any) {
    const regionGroupMap = {
      NORTE: { id: NFRETES_GROUP_ID_NORTE, name: 'Norte' },
      NORDESTE: { id: NFRETES_GROUP_ID_NORDESTE, name: 'Nordeste' },
      CENTRO_OESTE: { id: NFRETES_GROUP_ID_CENTRO_OESTE, name: 'Centro-Oeste' },
      SUDESTE: { id: NFRETES_GROUP_ID_SUDESTE, name: 'Sudeste' },
      SUL: { id: NFRETES_GROUP_ID_SUL, name: 'Sul' },
    };

    for (const [region, freights] of Object.entries(freightsByRegion)) {
      if (Array.isArray(freights) && freights.length > 0) {
        const groupInfo = regionGroupMap[region];
        if (!groupInfo || !groupInfo.id) {
          this.logger.warn(`Grupo não configurado para região: ${region}`);
          continue;
        }

        try {
          const message = this.formatGroupedFreightMessage(
            freights,
            groupInfo.name,
          );
          await this.fretebrasService.sendTextMessage(groupInfo.id, message);
          this.logger.log(
            `✅ Enviados ${freights.length} fretes para região ${region}`,
          );
        } catch (error) {
          this.logger.error(
            `❌ Erro ao enviar mensagem para região ${region}:`,
            error,
          );
        }
      }
    }
  }

  private formatGroupedFreightMessage(
    freights: any[],
    regionName: string,
  ): string {
    const link = 'https://motorista-convite.nfretes.com.br';
    let message = `🚛 *Novos Fretes Disponíveis - Região ${regionName}!*\n\n`;

    freights.forEach((freight, index) => {
      const origem =
        freight.origem_cidade && freight.origem_estado
          ? `${freight.origem_cidade} - ${freight.origem_estado}`
          : freight.origem || 'Origem não informada';

      const destino =
        freight.destino_cidade && freight.destino_estado
          ? `${freight.destino_cidade} - ${freight.destino_estado}`
          : freight.destino || 'Destino não informado';

      const tipoCarga = freight.carga || 'Carga não informada';
      const veiculo = freight.tipos_veiculo || 'Veículo não informado';

      // Formatar data e hora
      let dataHora = '';
      if (freight.created_at) {
        const date = new Date(freight.created_at);
        const dia = date.getDate().toString().padStart(2, '0');
        const mes = (date.getMonth() + 1).toString().padStart(2, '0');
        const ano = date.getFullYear();
        const hora = date.getHours().toString().padStart(2, '0');
        const minuto = date.getMinutes().toString().padStart(2, '0');
        dataHora = `${dia}/${mes}/${ano} às ${hora}:${minuto}`;
      }

      // Nome da transportadora
      const transportadora =
        freight.transportadora_nome ||
        freight.nome_transportadora ||
        'Transportadora';

      message += `━━━━━━━━━━━━━━━━━━━━\n`;
      message += `*Frete ${index + 1}* ${dataHora ? `- ${dataHora}` : ''}\n`;
      message += `🏢 *Transportadora:* ${transportadora}\n`;
      message += `📍 *Origem:* ${origem}\n`;
      message += `📍 *Destino:* ${destino}\n`;
      message += `📦 *Carga:* ${tipoCarga}\n`;
      message += `🚚 *Veículo:* ${veiculo}\n`;
      message += `🔗 ${link}\n\n`;
    });

    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `💡 *Como aceitar estes fretes:*\n`;
    message += `1️⃣ Clique no link acima de cada frete\n`;
    message += `2️⃣ Baixe o app nFretes Motorista\n`;
    message += `3️⃣ Procure pela origem do frete\n`;
    message += `4️⃣ Envie seu convite!\n\n`;
    message += `_Fretes disponíveis! Não perca essa oportunidade! 🚚💨_`;

    return message;
  }

  private async processAndSaveFreight(
    freightData: any,
  ): Promise<Freight | null> {
    try {
      // Buscar ou criar empresa
      let company = await this.companyRepository.findOne({
        where: { id: freightData.transportadora_id },
        relations: ['contacts'],
      });

      if (!company) {
        this.logger.log(
          `Empresa ${freightData.transportadora_id} não encontrada, consultando Fretebras DB...`,
        );
        company = await this.fetchAndCreateCompany(
          freightData.transportadora_id,
        );
        if (!company) return null;
      }

      // Adicionar nome da transportadora ao freightData para usar na mensagem
      freightData.transportadora_nome =
        company.name || company.nameFantasy || 'Transportadora';

      // Buscar ou criar contato
      let contactCompanyId = null;
      if (freightData.contatos) {
        contactCompanyId = await this.processContact(
          freightData.contatos,
          company.id,
        );
      } else if (company.contacts && company.contacts.length > 0) {
        contactCompanyId = company.contacts[0].id;
      }

      // Criar frete
      const freight = this.freightRepository.create({
        companyId: company.id,
        contactCompanyId,
        originCity: freightData.origem_cidade,
        originState: freightData.origem_estado,
        destinyCity: freightData.destino_cidade,
        destinyState: freightData.destino_estado,
        distance: freightData.distancia,
        product: freightData.carga,
        tracker: freightData.has_tracking || false,
        Valuefreight: this.parsePrice(freightData.preco),
        weightOfLoad: '0',
        calValue: PaymentMethod.TOCOMBINE,
        valueCall: this.mapValueCall(freightData.tipo_valor),
        unityMetric: UnityMetric.BYTONS,
        specieOfLoad: this.mapSpecieOfLoad(freightData.especie),
        Toll: freightData.pedagio_incluido
          ? Toll.INCLUEDVALUE
          : Toll.PAYMENTPARTY,
        vehicleTypes: this.mapVehicleTypes(freightData.tipos_veiculo),
        bodyTypes: this.mapBodyTypes(freightData.carrocerias),
      });

      return await this.freightRepository.save(freight);
    } catch (error) {
      this.logger.error('Erro ao processar e salvar frete:', error);
      return null;
    }
  }

  private async fetchAndCreateCompany(
    transportadoraId: string,
  ): Promise<Company | null> {
    this.logger.warn(`Empresa ${transportadoraId} não encontrada (Fretebras DB desativado)`);
    return null;
  }

  private async processContact(
    contatosData: any,
    companyId: string,
  ): Promise<string | null> {
    try {
      const contatos =
        typeof contatosData === 'string'
          ? JSON.parse(contatosData)
          : contatosData;
      if (contatos.whatsapp && contatos.whatsapp.length > 0) {
        const whatsappData = contatos.whatsapp[0];
        const phoneNumber = Object.keys(whatsappData)[0];
        const contactName = whatsappData[phoneNumber];

        const existingContact = await this.contactCompanyRepository.findOne({
          where: { companyId, name: contactName },
        });

        if (existingContact) {
          return existingContact.id;
        }

        const contact = await this.contactCompanyRepository.save({
          name: contactName,
          phoneNumber: phoneNumber,
          companyId: companyId,
        });
        return contact.id;
      }
    } catch (error) {
      this.logger.error('Erro ao processar contatos:', error);
    }
    return null;
  }

  private parsePrice(price: any): number {
    if (!price) return 0;
    if (typeof price === 'number') return price;
    if (typeof price === 'string') {
      const normalizedPrice = price.replace(/\./g, '').replace(',', '.');
      const parsedPrice = parseFloat(normalizedPrice);
      return isNaN(parsedPrice) ? 0 : parsedPrice;
    }
    return 0;
  }

  private mapValueCall(tipoValor: string): string {
    if (!tipoValor || tipoValor.toLowerCase().includes('combinar')) {
      return 'Por toneladas';
    }
    if (tipoValor.toLowerCase().includes('tonelada')) {
      return 'Por toneladas';
    }
    if (
      tipoValor.toLowerCase().includes('kg') ||
      tipoValor.toLowerCase().includes('quilo')
    ) {
      return 'Por quilos';
    }
    return 'Por toneladas';
  }

  private mapSpecieOfLoad(especie: string): SpecieOfLoad {
    if (!especie) return SpecieOfLoad.OTHERS;
    const especieLower = especie.toLowerCase();
    const map: Record<string, SpecieOfLoad> = {
      animais: SpecieOfLoad.ANIMAL,
      'big bag': SpecieOfLoad.BIGBAG,
      bobina: SpecieOfLoad.COIL,
      caixas: SpecieOfLoad.BOX,
      container: SpecieOfLoad.CONTAINER,
      fardos: SpecieOfLoad.BALES,
      fracionada: SpecieOfLoad.FRACTIONAL,
      granel: SpecieOfLoad.BULK,
      metro: SpecieOfLoad.METRIC_CUBIC,
      milheiro: SpecieOfLoad.MILHEIRO,
      mudanças: SpecieOfLoad.CHANGES,
      palhetes: SpecieOfLoad.PALLETS,
      paletes: SpecieOfLoad.PALLETS,
      passageiros: SpecieOfLoad.PASSENGER,
      sacos: SpecieOfLoad.BAGS,
      tambor: SpecieOfLoad.DRUM,
      unidades: SpecieOfLoad.UNITYS,
    };
    for (const [key, value] of Object.entries(map)) {
      if (especieLower.includes(key)) return value;
    }
    return SpecieOfLoad.OTHERS;
  }

  private mapVehicleTypes(tipos: string): VehicleType[] {
    if (!tipos) return [VehicleType.TRUCK];
    const tiposArray = tipos
      .replace(/"/g, '')
      .split(',')
      .map((t) => t.trim().toLowerCase());
    const result: VehicleType[] = [];
    const map: Record<string, VehicleType> = {
      '3/4': VehicleType.THREE_FOUR,
      'three quarter': VehicleType.THREE_QUARTER,
      fiorino: VehicleType.FIORINO,
      toco: VehicleType.TOCO,
      vcl: VehicleType.VCL,
      bitruck: VehicleType.BIT_TRUCK,
      'bit truck': VehicleType.BIT_TRUCK,
      truck: VehicleType.TRUCK,
      bitrem: VehicleType.BI_TRAIN,
      'bi train': VehicleType.BI_TRAIN,
      'carreta ls': VehicleType.CART_LS,
      carreta: VehicleType.CART,
      'cart ls': VehicleType.CART_LS,
      cart: VehicleType.CART,
      rodotrem: VehicleType.ROAD_TRAIN,
      'road train': VehicleType.ROAD_TRAIN,
      vanderleia: VehicleType.VANDERLEIA,
      vanderléia: VehicleType.VANDERLEIA,
    };
    tiposArray.forEach((tipo) => {
      for (const [key, value] of Object.entries(map)) {
        if (tipo === key || tipo.includes(key)) {
          if (!result.includes(value)) {
            result.push(value);
          }
          break;
        }
      }
    });
    return result.length > 0 ? result : [VehicleType.TRUCK];
  }

  private mapBodyTypes(carrocerias: string): BodyType[] {
    if (!carrocerias) return [BodyType.CHEST];
    const carroceriasArray = carrocerias
      .replace(/"/g, '')
      .split(',')
      .map((c) => c.trim().toLowerCase());
    const result: BodyType[] = [];
    const map: Record<string, BodyType> = {
      'baú refrigerado': BodyType.REFRIGERATED_CHEST,
      'bau refrigerado': BodyType.REFRIGERATED_CHEST,
      'baú frigorífico': BodyType.FRIDGE_CHEST,
      'bau frigorifico': BodyType.FRIDGE_CHEST,
      baú: BodyType.CHEST,
      bau: BodyType.CHEST,
      sider: BodyType.SIDER,
      caçamba: BodyType.BUCKET,
      cacamba: BodyType.BUCKET,
      'grade baixa': BodyType.LOW_GRILLE,
      graneleiro: BodyType.BULK_CARRIER,
      plataforma: BodyType.PLATFORM,
      prancha: BodyType.BOARD,
      cavalo: BodyType.ONLY_HORSE,
      container: BodyType.CONTAINER,
      gaiola: BodyType.CAGE,
      munck: BodyType.MUNK,
      munk: BodyType.MUNK,
      silo: BodyType.SILO,
      tanque: BodyType.TANK,
    };
    carroceriasArray.forEach((carroceria) => {
      for (const [key, value] of Object.entries(map)) {
        if (carroceria === key || carroceria.includes(key)) {
          if (!result.includes(value)) {
            result.push(value);
          }
          break;
        }
      }
    });
    return result.length > 0 ? result : [BodyType.CHEST];
  }
}

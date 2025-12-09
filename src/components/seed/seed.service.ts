import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Company } from '@entities/company.entity';
import { Freight } from '@entities/freight.entity';
import { ContactCompany } from '@entities/contact-company.entity';
import {
  FreightRequest,
  FreightRequestStatus,
} from '@entities/freight-requests.entity';
import {
  Notification,
  NotificationCategory,
  NotificationStatus,
  EntityType,
  IconStyles,
} from '@entities/notifications.entity';
import { UsersDrive } from '@entities/users-drive.entity';
import { UsersLocation } from '@entities/users-location.entity';
import { CompanyUsersContacts } from '@entities/company-users-contacts.entity';
import { Vehicle } from '@entities/vehicles.entity';
import {
  FreightLocal,
  SpecieOfLoad,
  TypeOfLoad,
  PaymentMethod,
  Toll,
} from 'src/enum/freight';
import { VehicleType, BodyType } from 'src/enum/vehicle';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(Freight)
    private freightRepository: Repository<Freight>,
    @InjectRepository(ContactCompany)
    private contactCompanyRepository: Repository<ContactCompany>,
    @InjectRepository(FreightRequest)
    private freightRequestsRepository: Repository<FreightRequest>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(UsersDrive)
    private usersDriveRepository: Repository<UsersDrive>,
    @InjectRepository(UsersLocation)
    private usersLocationRepository: Repository<UsersLocation>,
    @InjectRepository(CompanyUsersContacts)
    private companyUsersContactsRepository: Repository<CompanyUsersContacts>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
  ) {}

  async populateCompanyData(
    companyId: string,
    freightsCount: number,
    contactsCount: number,
  ) {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new HttpException('Empresa não encontrada', HttpStatus.NOT_FOUND);
    }

    const results = {
      company: {
        id: company.id,
        name: company.name,
      },
      contacts: [],
      freights: [],
      requests: [],
      notifications: [],
    };

    console.log(`Criando ${contactsCount} contatos...`);
    for (let i = 0; i < contactsCount; i++) {
      const contact = await this.createFakeContact(companyId, i);
      results.contacts.push(contact);
    }

    console.log(`Criando ${freightsCount} fretes...`);
    for (let i = 0; i < freightsCount; i++) {
      const freight = await this.createFakeFreight(companyId, i);
      results.freights.push(freight);

      const requestsPerFreight = Math.floor(Math.random() * 4) + 2;

      for (let j = 0; j < requestsPerFreight; j++) {
        const request = await this.createFakeRequest(freight.id, companyId);
        if (request) {
          results.requests.push(request);
        }
      }
    }

    console.log('Criando 20 notificações...');
    for (let i = 0; i < 20; i++) {
      const notification = await this.createFakeNotification(
        companyId,
        results.freights,
        i,
      );
      results.notifications.push(notification);
    }

    return {
      message: 'Dados populados com sucesso',
      summary: {
        contactsCreated: results.contacts.length,
        freightsCreated: results.freights.length,
        requestsCreated: results.requests.length,
        notificationsCreated: results.notifications.length,
      },
      data: results,
    };
  }

  private async createFakeContact(companyId: string, index: number) {
    const names = [
      'João Silva',
      'Maria Santos',
      'Pedro Oliveira',
      'Ana Costa',
      'Carlos Souza',
      'Juliana Lima',
      'Fernando Alves',
      'Patrícia Rocha',
    ];

    const name = names[index % names.length] || `Motorista ${index + 1}`;

    const contact = this.contactCompanyRepository.create({
      companyId,
      name,
      phoneNumber: this.generateRandomPhone(),
      email: `motorista${index + 1}_${Date.now()}@fake.com`,
      cpf: this.generateRandomCpf(),
      isActive: true,
    });

    return await this.contactCompanyRepository.save(contact);
  }

  private async createFakeFreight(companyId: string, index: number) {
    const cities = [
      { city: 'São Paulo', state: 'SP' },
      { city: 'Rio de Janeiro', state: 'RJ' },
      { city: 'Belo Horizonte', state: 'MG' },
      { city: 'Curitiba', state: 'PR' },
      { city: 'Porto Alegre', state: 'RS' },
    ];

    const origin = cities[Math.floor(Math.random() * cities.length)];
    let destiny = cities[Math.floor(Math.random() * cities.length)];

    while (destiny.city === origin.city) {
      destiny = cities[Math.floor(Math.random() * cities.length)];
    }

    const freight = this.freightRepository.create({
      companyId,
      originCity: origin.city,
      originState: origin.state,
      destinyCity: destiny.city,
      destinyState: destiny.state,
      shippingLocation: FreightLocal.NATIONAL,
      typeOfLoad: TypeOfLoad.COMPLETE,
      specieOfLoad: SpecieOfLoad.OTHERS,
      vehicleTypes: [VehicleType.TRUCK],
      product: 'Carga Geral',
      weightOfLoad: String(Math.floor(Math.random() * 20000) + 1000),
      valueCall: String(Math.floor(Math.random() * 8000) + 2000),
      calValue: PaymentMethod.VALORCONFIRMED,
      Toll: Toll.INCLUEDVALUE,
      isActive: true,
      security: true,
      lona: false,
      tracker: false,
    });

    return await this.freightRepository.save(freight);
  }

  private async createFakeRequest(freightId: string, companyId: string) {
    const statuses = [
      FreightRequestStatus.PENDING,
      FreightRequestStatus.ACCEPTED,
      FreightRequestStatus.REJECTED,
    ];

    const request = this.freightRequestsRepository.create({
      freightId,
      companyId,
      status: statuses[Math.floor(Math.random() * statuses.length)],
    });

    return await this.freightRequestsRepository.save(request);
  }

  private async createFakeNotification(
    companyId: string,
    freights: any[],
    index: number,
  ) {
    const titles = [
      'Nova solicitação de frete',
      'Frete aceito com sucesso',
      'Motorista confirmou entrega',
      'Documentação pendente',
      'Avaliação recebida',
    ];

    const messages = [
      'Você tem uma nova solicitação',
      'O motorista aceitou seu frete',
      'A entrega foi confirmada',
      'Envie os documentos necessários',
      'Nova avaliação recebida',
    ];

    const titleIndex = index % titles.length;
    const relatedFreight = freights.length > 0 ? freights[0] : null;

    const notification = this.notificationRepository.create({
      title: titles[titleIndex],
      message: messages[titleIndex],
      category: NotificationCategory.FREIGHT,
      senderType: EntityType.COMPANY,
      senderId: companyId,
      recipientType: EntityType.COMPANY,
      recipientId: companyId,
      status:
        Math.random() > 0.3
          ? NotificationStatus.UNREAD
          : NotificationStatus.READ,
      iconStyle: IconStyles.FREIGHT_REQUEST,
      relatedEntityType: 'freight',
      relatedEntityId: relatedFreight?.id || null,
      isBroadcast: false,
      payload: {},
    });

    return await this.notificationRepository.save(notification);
  }

  private generateRandomCpf(): string {
    const randomDigits = () => Math.floor(Math.random() * 10);
    const cpf = Array.from({ length: 11 }, randomDigits).join('');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  private generateRandomPhone(): string {
    const ddd = Math.floor(Math.random() * 89) + 11;
    const num = Math.floor(Math.random() * 900000000) + 100000000;
    return `(${ddd}) 9${num.toString().substring(0, 4)}-${num.toString().substring(4, 8)}`;
  }

  async updateDriversPhotosAndLocations(driverIds: string[]) {
    // URLs de fotos de motoristas (usando serviço de avatares)
    const driverPhotos = [
      'https://app-caminhoneiros.s3.us-east-1.amazonaws.com/avatar/00f948f4-d95c-4a5a-820a-8a1ddba9af6a/photo-face.jpg',
      'https://app-caminhoneiros.s3.us-east-1.amazonaws.com/avatar/007deabd-2635-41d8-a6be-4133afe7dbc4/photo-face.jpg',
      'https://app-caminhoneiros.s3.us-east-1.amazonaws.com/avatar/00a669bf-38b8-4d85-9df0-7cae495f1cf6/photo-face.jpg',
      'https://app-caminhoneiros.s3.us-east-1.amazonaws.com/avatar/00d29e5c-bd24-456e-98ee-65e4f6d5043b/photo-face.jpg',
      'https://app-caminhoneiros.s3.us-east-1.amazonaws.com/avatar/01aeeb0c-1b18-4574-95e7-ed4fbb153271/photo-face.jpg',
      'https://app-caminhoneiros.s3.us-east-1.amazonaws.com/avatar/037715d2-eeb6-4f0a-996a-788e4b7eeeab/photo-face.jpg',
      'https://app-caminhoneiros.s3.us-east-1.amazonaws.com/avatar/0509703c-5433-41cf-a71d-d3bfd9cb0ae0/photo-face.jpg',
      'https://app-caminhoneiros.s3.us-east-1.amazonaws.com/avatar/055eacbc-6928-4380-8e92-e659e38cd651/photo-face.jpg',
      'https://app-caminhoneiros.s3.us-east-1.amazonaws.com/avatar/06258229-a8d3-4b8e-a352-ea8355501c2b/photo-face.jpg',
      'https://app-caminhoneiros.s3.us-east-1.amazonaws.com/avatar/06f0108b-64ce-4807-98d6-900ef6b34b25/photo-face.jpg',
      'https://app-caminhoneiros.s3.us-east-1.amazonaws.com/avatar/074b0e8d-5d89-4e41-9df0-91838f02dd3d/photo-face.jpg',
      'https://app-caminhoneiros.s3.us-east-1.amazonaws.com/avatar/07a6bac4-1d2a-4fda-a0d8-73cbccf239d1/photo-face.jpg',
      'https://app-caminhoneiros.s3.us-east-1.amazonaws.com/avatar/07a86876-9636-4a3b-a86d-0c6013ccc756/photo-face.jpg',
      'https://app-caminhoneiros.s3.us-east-1.amazonaws.com/avatar/0ad4b98a-a9fb-44da-81db-ee5700186f24/photo-face.jpg',
      'https://app-caminhoneiros.s3.us-east-1.amazonaws.com/avatar/0bd25a04-e518-41a6-af3a-86734eb3791f/photo-face.jpg',
    ];

    // Localizações de cidades brasileiras (lat/long)
    const brazilianLocations = [
      { city: 'São Paulo - SP', lat: -23.5505, lng: -46.6333 },
      { city: 'Rio de Janeiro - RJ', lat: -22.9068, lng: -43.1729 },
      { city: 'Belo Horizonte - MG', lat: -19.9167, lng: -43.9345 },
      { city: 'Curitiba - PR', lat: -25.4284, lng: -49.2733 },
      { city: 'Porto Alegre - RS', lat: -30.0346, lng: -51.2177 },
      { city: 'Brasília - DF', lat: -15.8267, lng: -47.9218 },
      { city: 'Salvador - BA', lat: -12.9714, lng: -38.5014 },
      { city: 'Fortaleza - CE', lat: -3.7172, lng: -38.5433 },
      { city: 'Recife - PE', lat: -8.0476, lng: -34.877 },
      { city: 'Manaus - AM', lat: -3.119, lng: -60.0217 },
      { city: 'Campinas - SP', lat: -22.9099, lng: -47.0626 },
      { city: 'Goiânia - GO', lat: -16.6869, lng: -49.2648 },
      { city: 'Florianópolis - SC', lat: -27.5954, lng: -48.548 },
      { city: 'Santos - SP', lat: -23.9618, lng: -46.3322 },
    ];

    const drivers = await this.usersDriveRepository.find({
      where: { id: In(driverIds) },
    });

    if (drivers.length === 0) {
      throw new HttpException(
        'Nenhum motorista encontrado',
        HttpStatus.NOT_FOUND,
      );
    }

    const results = {
      driversUpdated: [],
      locationsCreated: [],
    };

    for (const driver of drivers) {
      // Atualizar foto do motorista
      const randomPhoto =
        driverPhotos[Math.floor(Math.random() * driverPhotos.length)];
      driver.photoFaceURL = randomPhoto;
      await this.usersDriveRepository.save(driver);

      results.driversUpdated.push({
        id: driver.id,
        name: driver.name,
        photoFaceURL: driver.photoFaceURL,
      });

      // Criar localização para o motorista
      const randomLocation =
        brazilianLocations[
          Math.floor(Math.random() * brazilianLocations.length)
        ];

      // Adicionar pequena variação nas coordenadas para simular movimento
      const latVariation = (Math.random() - 0.5) * 0.1; // ±0.05 graus
      const lngVariation = (Math.random() - 0.5) * 0.1;

      const location = this.usersLocationRepository.create({
        userId: driver.id,
        latitude: randomLocation.lat + latVariation,
        longitude: randomLocation.lng + lngVariation,
        city: randomLocation.city,
        lastUpdatedAt: new Date(),
      });

      await this.usersLocationRepository.save(location);

      results.locationsCreated.push({
        driverId: driver.id,
        city: location.city,
        latitude: location.latitude,
        longitude: location.longitude,
      });
    }

    return {
      message: 'Motoristas atualizados com sucesso',
      summary: {
        driversUpdated: results.driversUpdated.length,
        locationsCreated: results.locationsCreated.length,
      },
      data: results,
    };
  }

  async addDriversToCompanyContacts(companyId: string, driverIds: string[]) {
    // Verificar se empresa existe
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new HttpException('Empresa não encontrada', HttpStatus.NOT_FOUND);
    }

    // Verificar quais motoristas existem
    const drivers = await this.usersDriveRepository.find({
      where: { id: In(driverIds) },
    });

    if (drivers.length === 0) {
      throw new HttpException(
        'Nenhum motorista encontrado',
        HttpStatus.NOT_FOUND,
      );
    }

    const results = {
      company: {
        id: company.id,
        name: company.name,
      },
      contactsCreated: [],
      contactsSkipped: [],
    };

    for (const driver of drivers) {
      // Verificar se já existe relacionamento
      const existingContact = await this.companyUsersContactsRepository.findOne(
        {
          where: {
            companyId: companyId,
            userId: driver.id,
          },
        },
      );

      if (existingContact) {
        results.contactsSkipped.push({
          driverId: driver.id,
          driverName: driver.name,
          reason: 'Já existe contato',
        });
        continue;
      }

      // Criar relacionamento
      const contact = this.companyUsersContactsRepository.create({
        companyId: companyId,
        userId: driver.id,
      });

      await this.companyUsersContactsRepository.save(contact);

      results.contactsCreated.push({
        contactId: contact.id,
        driverId: driver.id,
        driverName: driver.name,
      });
    }

    return {
      message: 'Motoristas adicionados aos contatos da empresa',
      summary: {
        totalDriversRequested: driverIds.length,
        driversFound: drivers.length,
        contactsCreated: results.contactsCreated.length,
        contactsSkipped: results.contactsSkipped.length,
      },
      data: results,
    };
  }

  async updateDriversDataAndVehicles(driverIds: string[]) {
    const drivers = await this.usersDriveRepository.find({
      where: { id: In(driverIds) },
    });

    if (drivers.length === 0) {
      throw new HttpException(
        'Nenhum motorista encontrado',
        HttpStatus.NOT_FOUND,
      );
    }

    const vehicleTypesList = [
      VehicleType.TRUCK,
      VehicleType.BIT_TRUCK,
      VehicleType.CART,
      VehicleType.TOCO,
      VehicleType.BI_TRAIN,
    ];

    const bodyTypesList = [
      BodyType.CHEST,
      BodyType.FRIDGE_CHEST,
      BodyType.REFRIGERATED_CHEST,
      BodyType.SIDER,
      BodyType.PLATFORM,
    ];

    const brazilianCities = [
      { city: 'São Paulo', state: 'SP', zipcode: '01000-000' },
      { city: 'Rio de Janeiro', state: 'RJ', zipcode: '20000-000' },
      { city: 'Belo Horizonte', state: 'MG', zipcode: '30000-000' },
      { city: 'Curitiba', state: 'PR', zipcode: '80000-000' },
      { city: 'Porto Alegre', state: 'RS', zipcode: '90000-000' },
      { city: 'Brasília', state: 'DF', zipcode: '70000-000' },
      { city: 'Salvador', state: 'BA', zipcode: '40000-000' },
      { city: 'Fortaleza', state: 'CE', zipcode: '60000-000' },
    ];

    const streetNames = [
      'Rua das Flores',
      'Avenida Paulista',
      'Rua das Acácias',
      'Avenida Brasil',
      'Rua do Comércio',
      'Avenida Central',
      'Rua São João',
      'Avenida Independência',
    ];

    const results = {
      driversUpdated: [],
      vehiclesCreated: [],
    };

    for (const driver of drivers) {
      // Atualizar CNH se não tiver
      if (!driver.cnh) {
        driver.cnh = this.generateRandomCNH();
      }

      // Atualizar ANTT se não tiver
      if (!driver.antt) {
        driver.antt = this.generateRandomANTT();
      }

      // Atualizar endereço se não tiver
      if (!driver.street || !driver.city) {
        const randomCity =
          brazilianCities[Math.floor(Math.random() * brazilianCities.length)];
        const randomStreet =
          streetNames[Math.floor(Math.random() * streetNames.length)];

        driver.street = randomStreet;
        driver.number = String(Math.floor(Math.random() * 9000) + 1000);
        driver.city = randomCity.city;
        driver.state = randomCity.state;
        driver.zipcode = randomCity.zipcode;
        driver.country = 'Brasil';
      }

      await this.usersDriveRepository.save(driver);

      results.driversUpdated.push({
        id: driver.id,
        name: driver.name,
        cnh: driver.cnh,
        antt: driver.antt,
        address: `${driver.street}, ${driver.number} - ${driver.city}/${driver.state}`,
      });

      // Criar veículo para o motorista
      const randomVehicleType =
        vehicleTypesList[Math.floor(Math.random() * vehicleTypesList.length)];
      const randomBodyType =
        bodyTypesList[Math.floor(Math.random() * bodyTypesList.length)];

      const vehicle = this.vehicleRepository.create({
        userId: driver.id,
        vehicleType: randomVehicleType,
        bodyType: randomBodyType,
        plateNumber: this.generateRandomPlate(),
        plateState: driver.state || 'SP',
        year: Math.floor(Math.random() * 15) + 2010, // 2010-2024
        color: ['Branco', 'Preto', 'Prata', 'Azul', 'Vermelho'][
          Math.floor(Math.random() * 5)
        ],
        isPlateValid: true,
        tracker: Math.random() > 0.5,
      });

      await this.vehicleRepository.save(vehicle);

      results.vehiclesCreated.push({
        vehicleId: vehicle.id,
        driverId: driver.id,
        vehicleType: vehicle.vehicleType,
        bodyType: vehicle.bodyType,
        plateNumber: vehicle.plateNumber,
      });
    }

    return {
      message: 'Dados dos motoristas e veículos atualizados com sucesso',
      summary: {
        driversUpdated: results.driversUpdated.length,
        vehiclesCreated: results.vehiclesCreated.length,
      },
      data: results,
    };
  }

  private generateRandomCNH(): string {
    // Gerar CNH com 11 dígitos
    const cnh = Array.from({ length: 11 }, () =>
      Math.floor(Math.random() * 10),
    ).join('');
    return cnh;
  }

  private generateRandomANTT(): string {
    // Gerar ANTT com 9 dígitos
    const antt = Array.from({ length: 9 }, () =>
      Math.floor(Math.random() * 10),
    ).join('');
    return antt;
  }

  private generateRandomPlate(): string {
    // Formato: ABC-1D23 (padrão Mercosul)
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const plate =
      letters[Math.floor(Math.random() * letters.length)] +
      letters[Math.floor(Math.random() * letters.length)] +
      letters[Math.floor(Math.random() * letters.length)] +
      '-' +
      Math.floor(Math.random() * 10) +
      letters[Math.floor(Math.random() * letters.length)] +
      Math.floor(Math.random() * 10) +
      Math.floor(Math.random() * 10);
    return plate;
  }
}

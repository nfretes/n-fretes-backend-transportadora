import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';
import { Company } from '@entities/company.entity';
import { Freight } from '@entities/freight.entity';
import { ContactCompany } from '@entities/contact-company.entity';
import { FreightRequest } from '@entities/freight-requests.entity';
import { Notification } from '@entities/notifications.entity';
import { UsersDrive } from '@entities/users-drive.entity';
import { UsersLocation } from '@entities/users-location.entity';
import { CompanyUsersContacts } from '@entities/company-users-contacts.entity';
import { Vehicle } from '@entities/vehicles.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Company,
      Freight,
      ContactCompany,
      FreightRequest,
      Notification,
      UsersDrive,
      UsersLocation,
      CompanyUsersContacts,
      Vehicle,
    ]),
  ],
  controllers: [SeedController],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}

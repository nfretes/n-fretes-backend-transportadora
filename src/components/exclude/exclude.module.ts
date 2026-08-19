import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exclude } from 'src/entities/exclude.entity';
import { Company } from 'src/entities/company.entity';
import { UsersDrive } from 'src/entities/users-drive.entity';
import { ExcludeService } from './exclude.service';
import { ExcludeController } from './exclude.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Exclude, Company, UsersDrive])],
  providers: [ExcludeService],
  controllers: [ExcludeController],
  exports: [ExcludeService],
})
export class ExcludeModule {}

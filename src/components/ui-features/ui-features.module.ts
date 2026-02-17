import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UIFeature } from 'src/entities/ui-features.entity';
import { UIFeaturesController } from './ui-features.controller';
import { UIFeaturesService } from './ui-features.service';
import { UIFeaturesSeedService } from './ui-features-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([UIFeature])],
  controllers: [UIFeaturesController],
  providers: [UIFeaturesService, UIFeaturesSeedService],
  exports: [UIFeaturesService, UIFeaturesSeedService],
})
export class UIFeaturesModule {}

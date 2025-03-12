import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import typeorm from './config/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { AuthModule } from '@components/auth/auth.module';
import { SubscriptionModule } from '@components/subscriptions-company/subscription-company.module';
import { ContactCompanyModule } from '@components/contact-company/contact-company.module';
import { UsersContactCompanyModule } from '@components/users-contact-company/users-contact.module';
import { FreightModule } from '@components/freight/freight.module';
import { CompanyModule } from '@components/company/company.module';
import { FreightRequestModule } from './components/freight-request/freight-request.module';
import { FreightRouteModule } from '@components/freight-route/freight-route.module';
import { ReviewUserDriveModule } from '@components/review-users-drive/review-users-drive.module';

//Croon
import { FreightRequestCronModule } from '@components/cron/freight-requests/freight-request-croon-module';
import { NotificationsModule } from '@components/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        configService.get('typeorm'),
    }),

    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    SubscriptionModule,
    ContactCompanyModule,
    UsersContactCompanyModule,
    FreightModule,
    CompanyModule,
    FreightRequestModule,
    FreightRouteModule,
    ReviewUserDriveModule,
    FreightRequestCronModule,
    NotificationsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply().forRoutes('*');
  }
}

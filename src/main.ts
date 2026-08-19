import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { IntegrationsModule } from './components/integrations/integrations.module';
import { ConfigService } from '@nestjs/config';
import { json, urlencoded } from 'express';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { SdrModule } from '@components/sdr/srd.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  // CORS
  app.enableCors();

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  const config = new DocumentBuilder()
    .setTitle('NFretes Transportadora')
    .setDescription(
      'API do Backend para Gerenciamento de Transportadora. Esta API oferece funcionalidades como registro e autenticação de usuários (transportadora), rastreamento de geolocalização, gerenciamento de fretes disponíveis e correspondência de fretes com base nas preferências dos caminhoneiros. Além disso, permite que os caminhoneiros acessem informações detalhadas sobre os fretes listados, possibilitando um sistema eficiente para otimizar o processo de transporte e carga. A API inclui endpoints para login, registro de novos usuários, geolocalização em tempo real e match entre fretes e caminhoneiros.',
    )
    .setVersion('2.0')
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });
  SwaggerModule.setup('swagger', app, document);

  const externalConfig = new DocumentBuilder()
    .setTitle('NFretes - External API')
    .setDescription('API para integração externa promoflex.')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('External API', 'Endpoints para integrações externas')
    .build();
  const externalDocument = SwaggerModule.createDocument(app, externalConfig, {
    include: [IntegrationsModule],
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });
  SwaggerModule.setup('api/external/docs', app, externalDocument);


   const sdrConfig = new DocumentBuilder()
    .setTitle('NFretes - SDR API')
    .setDescription(
      'API exclusiva para equipe de SDR (Sales Development Representative). ' +
      'Fornece endpoints para análise de empresas, motoristas, performance de matching, ' +
      'análise de mercado e métricas de engajamento. Todos os endpoints requerem autenticação via x-api-key no header.',
    )
    .setVersion('1.0')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
        description: 'Chave de API para autenticação da equipe SDR',
      },
      'x-api-key',
    )
    .addTag('SDR - Desenvolvimento de Vendas', 'Endpoints para análise e prospecção')
    .build();
  const sdrDocument = SwaggerModule.createDocument(app, sdrConfig, {
    include: [SdrModule],
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });
  SwaggerModule.setup('docs/sdr/api', app, sdrDocument);


  const port = app.get(ConfigService).get<number>('PORT') || 3001;

  app.set('trust proxy', 1);
  await app.listen(port).then(() => {
    console.log(`Server running on http://localhost:${port}`);
  });
}
bootstrap();

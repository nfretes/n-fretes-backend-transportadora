import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { json, urlencoded } from 'express';
import { HttpExceptionFilter } from './filters/http-exception.filter';

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

  // Swagger Config
  const config = new DocumentBuilder()
    .setTitle('NFretes Transportadora')
    .setDescription(
      'API do Backend para Gerenciamento de Transportadora. Esta API oferece funcionalidades como registro e autenticação de usuários (transportadora), rastreamento de geolocalização, gerenciamento de fretes disponíveis e correspondência de fretes com base nas preferências dos caminhoneiros. Além disso, permite que os caminhoneiros acessem informações detalhadas sobre os fretes listados, possibilitando um sistema eficiente para otimizar o processo de transporte e carga. A API inclui endpoints para login, registro de novos usuários, geolocalização em tempo real e match entre fretes e caminhoneiros.',
    )
    .setVersion('2.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  const port = app.get(ConfigService).get<number>('PORT') || 3001;

  app.set('trust proxy', 1);
  await app.listen(port).then(() => {
    console.log(`Server running on http://localhost:${port}`);
  });
}
bootstrap();

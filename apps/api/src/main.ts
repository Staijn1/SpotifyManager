/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { INestApplication, Logger } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { json, urlencoded } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './app/filters/all-exceptions-filter/all-exceptions-filter.filter';

function setupSwagger(app: INestApplication, swaggerUrl: string) {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Spotify Manager API')
    .setDescription('The API behind spotify manager')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(swaggerUrl, app, document);
}

async function bootstrap() {
  const globalPrefix = 'api';
  const port = process.env.PORT || 3333;
  const app = await NestFactory.create(AppModule);
  const adapterHost = app.get(HttpAdapterHost);
  app.setGlobalPrefix(globalPrefix);
  setupSwagger(app, globalPrefix);

  app.useGlobalFilters(new AllExceptionsFilter(adapterHost));
  app.enableCors();

  app.use(json({ limit: '1mb' }));
  app.use(urlencoded({ extended: true, limit: '1mb' }));


  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();

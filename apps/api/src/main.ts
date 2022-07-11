/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';


/**
 * Bootstraps the application.
 * @returns {Promise<void>}
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // read the version from package.json
  const config = new DocumentBuilder()
    .setTitle('Spotify Manager API')
    .setDescription('The API behind spotify manager')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);


  const port = process.env.PORT || 3333;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/api`
  );
}

bootstrap();

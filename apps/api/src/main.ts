/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { INestApplication, Logger } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { SeqTransport } from '@datalust/winston-seq';
import * as winston from 'winston';
import { AppModule } from './app/app.module';
import { json, urlencoded } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './app/filters/all-exceptions-filter/all-exceptions-filter.filter';
import { environment } from './environments/environment';

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

/**
 * Create a logger for the application using Winston instead of the built-in nestjs logger.
 * Allows for logging to multiple transports, such as the console and Seq, or modifying the log format.
 */
const createLogger = () => {
  const logLevel = process.env.MIN_LOG_LEVEL ?? 'info';
  return WinstonModule.createLogger({
    level: logLevel,
    format: winston.format.combine(   /* This is required to get errors to log with stack traces. See https://github.com/winstonjs/winston/issues/1498 */
      winston.format.errors({stack: true}),
      winston.format.json(),
    ),
    defaultMeta: {
      Application: 'SpotifyManager',
      Environment: process.env.NODE_ENV || 'Local',
    },
    transports: [
      // log everything to the console
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize({
            all: true,
          }),
          winston.format.simple(),
        ),
      }),
      new SeqTransport({
        serverUrl: process.env.SEQ_URL ?? 'http://localhost:5341',
        apiKey: undefined,
        onError: (e => {
          console.error("An error occurred whilst setting up the Seq Transport!", e);
          process.exit(-1);
        }),
        handleExceptions: true,
        handleRejections: true,
      }),
    ],
  });
};

async function bootstrap() {
  const globalPrefix = 'api';
  const port = process.env.PORT ?? 3333;
  const app = await NestFactory.create(AppModule, {
    logger: createLogger(),
  });

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
  Logger.log(`Is production mode: ${environment.production}`)
}

bootstrap();

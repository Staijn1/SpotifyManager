import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {TypeOrmModuleOptions, TypeOrmOptionsFactory} from '@nestjs/typeorm';
import {DatabaseLogger} from './DatabaseLogger';
import {join} from 'path';
import {DataSourceOptions} from "typeorm";
import {IDatabaseConfiguration, IHeliosConfiguration} from "../configuration/ConfigurationTypes";


@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
    private static readonly logger = new Logger(TypeOrmConfigService.name);
    private static readonly databaseLogger = new DatabaseLogger();

    constructor(private config: ConfigService) {
    }


    /**
     * Builds the options to use for TypeORM
     */
    public createTypeOrmOptions(): TypeOrmModuleOptions {
        const dbConfig = this.config.get<IHeliosConfiguration['database']>('database');

        return {
            ...TypeOrmConfigService.GetBaseDatasourceOptions(dbConfig),
            autoLoadEntities: true,
        };
    }

    /**
     * Base datasource options used for application AND generating / running migrations.
     * For application-specific options, see {@link TypeOrmConfigService.createTypeOrmOptions}
     */
    public static GetBaseDatasourceOptions(dbConfig: IDatabaseConfiguration): DataSourceOptions {
        // Make sure we don't log our password, but we do log the rest of the configuration
        const configSafeToLog = {...dbConfig, password: 'REDACTED'};
        this.logger.log(`Connecting to database user the following configuration: ${JSON.stringify(configSafeToLog, null, 2)}`);

        return {
            type: 'mongodb',
            host: dbConfig.host,
            port: dbConfig.port,
            database: dbConfig.database,
            username: dbConfig.username,
            password: dbConfig.password,
            migrations: [join(__dirname, '../../../migrations/*.{ts,js}')],
            entities: [join(__dirname, '../../**/*.entity.{ts,js}')],
            logger: this.databaseLogger,
            logging: true,
            authSource: 'admin',
            synchronize: true
        }
    }
}

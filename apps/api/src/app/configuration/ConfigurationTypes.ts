export interface IDatabaseConfiguration {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}


export interface IAppSettings {
  database: IDatabaseConfiguration;
}

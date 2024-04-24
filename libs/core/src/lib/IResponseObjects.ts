/**
 * In this file you can define the responses for endpoints in the API.
 * Do NOT decorate these interfaces with NestJS @ApiProperty decorators for Swagger, as it will lead to crashes in the front-end.
 * Instead, create a separate class in the API project that implements these interfaces and decorates them with @ApiProperty.
 */


import { IUserPreferences } from './UserPreferences';


export type IUserPreferencesResponse = IUserPreferences | null;

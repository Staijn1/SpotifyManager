import { Body, Controller, Get, Put } from '@nestjs/common';
import { UserPreferencesService } from '../services/user-preferences.service';
import { UserPreferencesRequest } from '../../../RequestObjectsDecorated';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('user-preferences')
@ApiBearerAuth()
@ApiTags('user-preferences')
export class UserPreferencesController {
  constructor(private readonly userPreferencesService: UserPreferencesService) {
  }

  @Get()
  async getUserPreferences() {
    return this.userPreferencesService.getUserPreferences();
  }

  @Put()
  async createOrUpdateUserPreferences(@Body() updatedUserPreferences: UserPreferencesRequest) {
    return this.userPreferencesService.createOrUpdateUserPreferences(updatedUserPreferences);
  }

  @Get('email-frequencies')
  async getEmailFrequencies() {
    return this.userPreferencesService.getEmailFrequencies();
  }
}

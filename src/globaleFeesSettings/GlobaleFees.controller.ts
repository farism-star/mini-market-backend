import { 
    Controller, 
    Get, 
    Post, 
    Body, 
    UseGuards 
  } from '@nestjs/common';
  import { AuthGuard } from '@nestjs/passport';
  import { RolesGuard } from '../auth/roles.gaurd';
  import { Roles } from '../auth/Role.decorator';
  import { Role } from '../auth/roles.enum';
  import { GlobalFeesSettingsDto } from './dtos/globaleFees.dto';
  import { GlobalFeesSettingsService } from './GlobaleFees.service';
  @Controller('admin/global-fees-settings')
  @UseGuards(AuthGuard('jwt'), RolesGuard) 
  @Roles(Role.ADMIN,Role.OWNER)
  export class GlobalFeesSettingsController {
    constructor(private settingsService: GlobalFeesSettingsService) {}
  
    
    @Get()
    async getSettings() {
      return this.settingsService.getSettings();
    }
  
   
    @Post()
    async updateSettings(@Body() dto: GlobalFeesSettingsDto) {
      return this.settingsService.updateSettings(dto);
    }
  }
  
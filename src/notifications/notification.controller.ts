import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "src/auth/roles.gaurd";
import { Roles } from "src/auth/Role.decorator";
import { Role } from "src/auth/roles.enum";

@Controller('notifications')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class NotificationController {
  constructor(private service: NotificationService) {}

  @Roles(Role.OWNER, Role.CLIENT)
  @Post()
  create(@Body() dto: CreateNotificationDto) {
    return this.service.create(dto);
  }

  @Roles(Role.OWNER, Role.CLIENT)
  @Patch(':id')
  update(@Param('id') id: string, @Body('body') body: string) {
    return this.service.update(id, body);
  }

  @Roles(Role.OWNER, Role.CLIENT)
  @Get(':userId')
  getUserNotifications(@Param('userId') userId: string) {
    return this.service.getUserNotifications(userId);
  }

  @Roles(Role.OWNER, Role.CLIENT)
  @Patch('read/:id')
  markAsRead(@Param('id') id: string) {
    return this.service.markAsRead(id);
  }

  @Roles(Role.OWNER, Role.CLIENT)
  @Patch('read-all/:userId')
  markAll(@Param('userId') userId: string) {
    return this.service.markAllAsRead(userId);
  }

  @Roles(Role.OWNER, Role.CLIENT)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}


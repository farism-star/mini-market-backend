import { Controller, Get, Post, Body, Param,UseGuards, Query } from '@nestjs/common';
import { MessageService } from './message.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.gaurd';
import { Roles } from '../auth/Role.decorator';
import { Role } from '../auth/roles.enum';
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}
 @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.CLIENT, Role.OWNER)
  @Post()
  async create(
    @Body('conversationId') conversationId: string,
    @Body('senderId') senderId: string,
    @Body('text') text: string,
  ) {
    return this.messageService.createMessage(conversationId, senderId, text);
  }
 @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.CLIENT, Role.OWNER)
  @Get(':conversationId')
  async getMessages(
    @Param('conversationId') conversationId: string,
    @Query('page') page: string,
    @Query('limit') limit: string
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;

    return this.messageService.getMessages(conversationId, pageNum, limitNum);
  }
}

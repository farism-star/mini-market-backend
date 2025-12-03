import { Controller, Get, Post, Body, Param,UseGuards,BadRequestException,Req } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.gaurd';
import { Roles } from '../auth/Role.decorator';
import { Role } from '../auth/roles.enum';
@Controller({
  path:'conversations',
  version:'1'
})
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.CLIENT, Role.OWNER)
@Post()
async create(@Body('users') users: string[]) {
  if (!Array.isArray(users) || users.length !== 2) {
    throw new BadRequestException('users must contain exactly 2 user IDs');
  }

  const [user1, user2] = users;

  return this.conversationService.createConversation(user1, user2);
}

 @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.CLIENT, Role.OWNER)
  @Get('/user/')
  async getUserConversations(@Req() req: any) {
const userId =req.user.id
    return this.conversationService.getUserConversations(userId);
  }
 @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.CLIENT, Role.OWNER)
  @Get('single/:conversationId')
  async getConversation(@Param('conversationId') id: string) {
    return this.conversationService.getConversationById(id);
  }
}

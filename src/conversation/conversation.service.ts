import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ConversationService {
  constructor(private prisma: PrismaService) {}

  async createConversation(user1: string, user2: string) {
    let conversation = await this.prisma.conversation.findFirst({
      where: {
        users: { hasEvery: [user1, user2] },
      },
    });

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          users: [user1, user2],
        },
      });
    }

    return conversation;
  }

  async getUserConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: { users: { has: userId } },
      include: { messages: true },
    });
  }

  async getConversationById(conversationId: string) {
    return this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: true },
    });
  }
}

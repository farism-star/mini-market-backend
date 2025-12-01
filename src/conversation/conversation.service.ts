import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ConversationService {
  constructor(private prisma: PrismaService) { }

  async createConversation(user1: string, user2: string) {
    if (user1 === user2) {
      throw new ConflictException('Users is  The Same  ');
    }
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
    // 1) Fetch all conversations of this user
    const conversations = await this.prisma.conversation.findMany({
      where: { users: { has: userId } },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return Promise.all(
      conversations.map(async (conv) => {
        // 2) Get the other participant (not me)
        const otherUserId = conv.users.find((uid) => uid !== userId);

        const otherUser = await this.prisma.user.findUnique({
          where: { id: otherUserId },
          select: {
            id: true,
            name: true,
            image: true,
          },
        });

        // 3) Last message
        const lastMsg = conv.messages[0];

        // 4) Count unread messages
        const unread = conv.messages.filter(
          (m) => m.senderId !== userId && !m.isRead
        ).length;


        return {
          id: conv.id,
          user: otherUser,
          lastMessage: lastMsg
            ? {
              id: lastMsg.id,
              type: lastMsg.type,
              senderId: lastMsg.senderId,
              text: lastMsg.text,
              image: lastMsg.imageUrl,
              voice: lastMsg.voice,
              createdAt: lastMsg.createdAt
            }
            : null,
          unreadMessages: unread,
        };
      })
    );
  }


  async getConversationById(conversationId: string) {
    return this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: true },
    });
  }
}

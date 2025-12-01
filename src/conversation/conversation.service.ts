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
  const conversations = await this.prisma.conversation.findMany({
    where: { users: { has: userId } },

    include: {
      // آخر رسالة فقط
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },

      // احسب unread مباشرة من الداتا
      _count: {
        select: {
          messages: {
            where: {
              senderId: { not: userId },
              isRead: false,
            },
          },
        },
      },
    },
  });

  return Promise.all(
    conversations.map(async (conv) => {
      const otherUserId = conv.users.find((uid) => uid !== userId);

      const otherUser = await this.prisma.user.findUnique({
        where: { id: otherUserId },
        select: { id: true, name: true, image: true },
      });

      const lastMsg = conv.messages[0];

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
              createdAt: lastMsg.createdAt,
            }
          : null,

        unreadMessages: conv._count.messages, // ← الحل هنا
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

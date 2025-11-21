import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  // إنشاء رسالة
  async createMessage(conversationId: string, senderId: string, text: string) {
    return this.prisma.message.create({
      data: {
        conversationId,
        senderId,
        text,
      },
    });
  }

  // جلب كل الرسائل لمحادثة معينة
  async getMessages(conversationId: string) {
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }
}

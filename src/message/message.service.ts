import { Injectable, NotFoundException } from '@nestjs/common';
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
  async getMessages(
    conversationId: string,
    page: number = 1,
    limit: number = 20
  ) {
    
    const conversationExists = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversationExists) {
      throw new NotFoundException('Conversation not found');
    }

    // احسب الـ offset
    const skip = (page - 1) * limit;

    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    // إجمالي عدد الرسائل (اختياري)
    const total = await this.prisma.message.count({
      where: { conversationId },
    });

    return {
      page,
      limit,
      total,
      messages,
    };
  }
}

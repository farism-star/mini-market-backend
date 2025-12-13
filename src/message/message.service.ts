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

 
async getMessages(
  conversationId: string,
  userId: string,
  page: number = 1,
  limit: number = 20
) {
  const conversationExists = await this.prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversationExists) {
    throw new NotFoundException('Conversation not found');
  }

  // 🔹 نعمل read للرسائل اللي مش أنا باعتها
  await this.prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      isRead: false,
    },
    data: { isRead: true },
  });

  const skip = (page - 1) * limit;

  // 🔹 هنا نجيب الرسائل ومعاها sender object
  const messages = await this.prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit,
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true, 
        },
      },
    },
  });

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



async deleteMessages(){
 await this.prisma.message.deleteMany({}); 
}



}

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { SendMessageDto, MessageType } from '../message/dto/send-message.dto';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { FirebaseService } from '../firbase/firebase.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class SocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private firebaseService: FirebaseService,
  ) {}

  @WebSocketServer()
  server: Server;

  private readonly uploadDir = join(process.cwd(), 'uploads');

  async handleConnection(client: Socket) {
    const token = client.handshake.auth.token as string;
    if (!token) {
      console.log('❌ Client connection rejected: No token provided');
      return client.disconnect();
    }

    try {
      const payload = await this.jwt.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      client.data.userId = payload.sub || payload.id;
      console.log(`✅ Client connected: ${client.id} (User: ${client.data.userId})`);
      client.emit('connected', {
        status: 'success',
        userId: client.data.userId,
      });
    } catch (error) {
      console.log(`❌ Client authentication failed: ${client.id}`);
      client.emit('error', { message: 'Invalid authentication token' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`🔴 Client disconnected: ${client.id} (User: ${client.data.userId || 'Unknown'})`);
  }

  @SubscribeMessage('joinConversation')
  async joinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `room_${data.conversationId}`;
    await client.join(room);
    console.log(`👥 Client ${client.id} joined conversation: ${data.conversationId}`);
    return { status: 'joined', room };
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(
    @MessageBody() data: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      let imageUrl: string | null = null;
      let voiceUrl: string | null = null;

      // إنشاء مجلد الرفع إذا لم يكن موجوداً
      if (!existsSync(this.uploadDir)) {
        mkdirSync(this.uploadDir, { recursive: true });
        console.log(`📁 Created upload directory: ${this.uploadDir}`);
      }

      // معالجة الصورة
      if (data.type === MessageType.IMAGE && data.image) {
        try {
          const matches = data.image.match(/^data:(image\/[A-Za-z0-9.+-]+);base64,/);
          let ext = '.png';
          if (matches) {
            let rawExt = matches[1].split('/')[1];
            rawExt = rawExt.replace(/\+xml$/, '');
            ext = '.' + rawExt;
          }
          const fileName = `chat-img-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
          const filePath = join(this.uploadDir, fileName);
          const base64Data = data.image.replace(/^data:image\/[A-Za-z0-9.+-]+;base64,/, '');
          writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
          imageUrl = `/uploads/${fileName}`;
          console.log(`📷 Image saved: ${fileName}`);
        } catch (error) {
          console.error('❌ Error saving image:', error.message);
        }
      }

      // معالجة الصوت
      if (data.type === MessageType.VOICE && data.voice) {
        try {
          const matches = data.voice.match(/^data:audio\/(\w+);base64,/);
          const ext = matches ? '.' + matches[1] : '.mp3';
          const fileName = `chat-voice-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
          const filePath = join(this.uploadDir, fileName);
          const base64Data = data.voice.replace(/^data:audio\/\w+;base64,/, '');
          writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
          voiceUrl = `/uploads/${fileName}`;
          console.log(`🎤 Voice saved: ${fileName}`);
        } catch (error) {
          console.error('❌ Error saving voice:', error.message);
        }
      }

      // البحث عن المحادثة
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: data.conversationId },
        select: { users: true },
      });

      if (!conversation) {
        console.error(`❌ Conversation not found: ${data.conversationId}`);
        return { status: 'error', message: 'Conversation not found' };
      }

      const receiverId = conversation.users.find(id => id !== data.senderId);

      // إنشاء الرسالة
      const messagePromise = this.prisma.message.create({
        data: {
          conversationId: data.conversationId,
          senderId: data.senderId,
          text: data.text || null,
          imageUrl,
          voice: voiceUrl,
          isRead: false,
          type: data.type,
        },
      });

      // تحديد محتوى الإشعار
      let notificationBody = 'لديك رسالة جديدة';
      if (data.type === MessageType.TEXT && data.text) {
        notificationBody = data.text;
      } else if (data.type === MessageType.IMAGE) {
        notificationBody = '📷 رسالة تحتوي على صورة';
      } else if (data.type === MessageType.VOICE) {
        notificationBody = '🎤 رسالة صوتية';
      }

      // مهام الإشعارات - باستخدام Promise.allSettled لتجنب توقف التنفيذ
      const notificationTasks: Promise<any>[] = [];

      if (receiverId) {
        // إنشاء إشعار في قاعدة البيانات
        notificationTasks.push(
          this.prisma.notification
            .create({
              data: {
                userId: receiverId,
                body: notificationBody,
                isRead: false,
              },
            })
            .catch((error) => {
              console.error('❌ Error creating notification in DB:', error.message);
              return null;
            }),
        );

        // جلب معلومات المستقبل
        const receiver = await this.prisma.user.findUnique({
          where: { id: receiverId },
          select: { fcmToken: true, name: true },
        });

        // إرسال إشعار Firebase إذا كان الـ token موجود
        if (receiver?.fcmToken) {
          notificationTasks.push(
            this.firebaseService
              .sendNotification(
                receiver.fcmToken,
                'رسالة جديدة',
                notificationBody,
                {
                  conversationId: data.conversationId,
                  senderId: data.senderId,
                  type: 'new_message',
                },
              )
              .catch((error) => {
                console.error(`❌ Error sending FCM notification to ${receiverId}:`, error.message);
                // لا نوقف التنفيذ، فقط نسجل الخطأ
                return { success: false, error: error.message };
              }),
          );
        } else {
          console.log(`⚠️ Receiver ${receiverId} has no FCM token`);
        }
      }

      // تنفيذ جميع المهام باستخدام Promise.allSettled
      const [messageResult, ...notificationResults] = await Promise.allSettled([
        messagePromise,
        ...notificationTasks,
      ]);

      // التحقق من نجاح إنشاء الرسالة
      if (messageResult.status === 'rejected') {
        console.error('❌ Failed to create message:', messageResult.reason);
        throw new Error('Failed to create message');
      }

      const message = messageResult.value;

      // حساب عدد الإشعارات الناجحة
      const notificationSuccess = notificationResults.filter(
        (r) => r.status === 'fulfilled' && r.value && r.value !== null,
      ).length;

      console.log(
        `✅ Message sent (ID: ${message.id}). Notifications: ${notificationSuccess}/${notificationResults.length} successful`,
      );

      // إرسال الرسالة عبر WebSocket
      this.server.to(`room_${data.conversationId}`).emit('newMessage', message);

      return {
        status: 'sent',
        message,
        notificationsSent: notificationSuccess,
      };
    } catch (error) {
      console.error('❌ Error in sendMessage:', error.message);
      return {
        status: 'error',
        message: error.message || 'Unknown error occurred',
      };
    }
  }

  // دوال إضافية مفيدة
  @SubscribeMessage('leaveConversation')
  async leaveConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `room_${data.conversationId}`;
    await client.leave(room);
    console.log(`👋 Client ${client.id} left conversation: ${data.conversationId}`);
    return { status: 'left', room };
  }

  @SubscribeMessage('markAsRead')
  async markAsRead(
    @MessageBody() data: { messageId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const message = await this.prisma.message.update({
        where: { id: data.messageId },
        data: { isRead: true },
      });

      this.server.to(`room_${message.conversationId}`).emit('messageRead', {
        messageId: data.messageId,
      });

      console.log(`✅ Message marked as read: ${data.messageId}`);
      return { status: 'success', message };
    } catch (error) {
      console.error('❌ Error marking message as read:', error.message);
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @MessageBody() data: { conversationId: string; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(`room_${data.conversationId}`).emit('userTyping', {
      userId: client.data.userId,
      isTyping: data.isTyping,
    });
  }
}
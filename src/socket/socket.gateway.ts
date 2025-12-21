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
    if (!token) return client.disconnect();

    try {
      const payload = await this.jwt.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      client.data.userId = payload.sub || payload.id;
      client.emit('connected', {
        status: 'success',
        userId: client.data.userId,
      });
    } catch {
      client.emit('error', { message: 'Invalid authentication token' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`🔴 Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinConversation')
  async joinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `room_${data.conversationId}`;
    await client.join(room);
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
  
      if (!existsSync(this.uploadDir)) {
        mkdirSync(this.uploadDir, { recursive: true });
      }
  
      if (data.type === MessageType.IMAGE && data.image) {
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
      }
  
      if (data.type === MessageType.VOICE && data.voice) {
        const matches = data.voice.match(/^data:audio\/(\w+);base64,/);
        const ext = matches ? '.' + matches[1] : '.mp3';
        const fileName = `chat-voice-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        const filePath = join(this.uploadDir, fileName);
        const base64Data = data.voice.replace(/^data:audio\/\w+;base64,/, '');
        writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
        voiceUrl = `/uploads/${fileName}`;
      }
  
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: data.conversationId },
        select: { users: true },
      });
  
      const receiverId = conversation?.users.find(id => id !== data.senderId);
  
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
  
      let notificationBody = 'لديك رسالة جديدة';
      if (data.type === MessageType.TEXT && data.text) notificationBody = data.text;
      if (data.type === MessageType.IMAGE) notificationBody = 'رسالة تحتوي على صورة';
      if (data.type === MessageType.VOICE) notificationBody = 'رسالة صوتية';
  
      const notificationTasks: Promise<any>[] = [];
  
      if (receiverId) {
        notificationTasks.push(
          this.prisma.notification.create({
            data: {
              userId: receiverId,
              body: notificationBody,
              isRead: false,
            },
          }),
        );
  
        const receiver = await this.prisma.user.findUnique({
          where: { id: receiverId },
          select: { fcmToken: true },
        });
  
        if (receiver?.fcmToken) {
          notificationTasks.push(
            this.firebaseService.sendNotification(
              receiver.fcmToken,
              'رسالة جديدة',
              notificationBody,
              { conversationId: data.conversationId },
            ),
          );
        }
      }
  
      const [message] = await Promise.all([
        messagePromise,
        ...notificationTasks,
      ]);
  
      this.server.to(`room_${data.conversationId}`).emit('newMessage', message);
  
      return { status: 'sent', message };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
  

}
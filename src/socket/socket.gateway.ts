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
import { extname } from 'path';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    const token = client.handshake.auth.token as string;
    if (!token) return client.disconnect();

    try {
      const payload = await this.jwt.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      client.data.userId = payload.sub || payload.id;

      client.emit('connected', { status: 'success', userId: client.data.userId });
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

      // حفظ الصورة لو موجودة
      if (data.type === MessageType.IMAGE && data.image) {
        const folder = './uploads/chat-images';
        if (!existsSync(folder)) mkdirSync(folder, { recursive: true });

        const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(data.image || 'image.png')}`;
        const filePath = `${folder}/${fileName}`;

        // افترضنا ان البيانات Base64
        const base64Data = data.image.replace(/^data:image\/\w+;base64,/, '');
        writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
        imageUrl = filePath;
      }

      // حفظ الصوت لو موجود
      if (data.type === MessageType.VOICE && data.voice) {
        const folder = './uploads/chat-voices';
        if (!existsSync(folder)) mkdirSync(folder, { recursive: true });

        const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(data.voice || 'voice.mp3')}`;
        const filePath = `${folder}/${fileName}`;

        // افترضنا ان البيانات Base64
        const base64Data = data.voice.replace(/^data:audio\/\w+;base64,/, '');
        writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
        voiceUrl = filePath;
      }

      // حفظ الرسالة في DB
      const message = await this.prisma.message.create({
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

      // إرسال الرسالة لكل الأعضاء في الغرفة
      const room = `room_${data.conversationId}`;
      this.server.to(room).emit('newMessage', message);

      return { status: 'sent', message };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}

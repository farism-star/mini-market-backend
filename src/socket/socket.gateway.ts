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
  ) {}

  @WebSocketServer()
  server: Server;

  // 📁 مسار ثابت للـ uploads (نفس سلوك Multer): **تم التعديل هنا** ليستخدم process.cwd()
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

      // تأكد إن uploads موجود (سيتم إنشاءه في جذر المشروع الآن)
      if (!existsSync(this.uploadDir)) {
        mkdirSync(this.uploadDir, { recursive: true });
        console.log('📁 uploads folder created at:', this.uploadDir);
      }
console.log("message From User")
      /* ================= IMAGE ================= */
      if (data.type === MessageType.IMAGE && data.image) {
        try {
          const matches = data.image.match(
            /^data:(image\/[A-Za-z0-9.+-]+);base64,/,
          );

          let ext = '.png';
          if (matches) {
            const mime = matches[1];
            let rawExt = mime.split('/')[1];
            rawExt = rawExt.replace(/\+xml$/, '');
            ext = '.' + rawExt;
          }

          const fileName = `chat-img-${Date.now()}-${Math.round(
            Math.random() * 1e9,
          )}${ext}`;

          const filePath = join(this.uploadDir, fileName);
          const base64Data = data.image.replace(
            /^data:image\/[A-Za-z0-9.+-]+;base64,/,
            '',
          );

          writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
          console.log('✅ Image saved:', filePath);

          imageUrl = `/uploads/${fileName}`; // المسار للوصول عبر HTTP
        } catch (err) {
          console.error('❌ Image save error:', err);
        }
      }

      /* ================= VOICE ================= */
      if (data.type === MessageType.VOICE && data.voice) {
        try {
          const matches = data.voice.match(/^data:audio\/(\w+);base64,/);
          const ext = matches ? '.' + matches[1] : '.mp3';

          const fileName = `chat-voice-${Date.now()}-${Math.round(
            Math.random() * 1e9,
          )}${ext}`;

          const filePath = join(this.uploadDir, fileName);
          const base64Data = data.voice.replace(
            /^data:audio\/\w+;base64,/,
            '',
          );

          writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
          console.log('✅ Voice saved:', filePath);

          voiceUrl = `/uploads/${fileName}`; // المسار للوصول عبر HTTP
        } catch (err) {
          console.error('❌ Voice save error:', err);
        }
      }

      /* ================= SAVE MESSAGE ================= */
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

      const room = `room_${data.conversationId}`;
      this.server.to(room).emit('newMessage', message);

      return { status: 'sent', message };
    } catch (error) {
      console.error('❌ sendMessage error:', error);
      return { status: 'error', message: error.message };
    }
  }
}
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
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true
  },
  transports: ['websocket', 'polling']
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private cloudinary: CloudinaryService
  ) {}

  @WebSocketServer()
  server: Server;



  async handleConnection(client: Socket) {
 
    const token = client.handshake.auth.token as string;
    
    if (!token) {
      console.log('❌ No token provided, disconnecting client:', client.id);
      return client.disconnect();
    }

    try {
      const payload = await this.jwt.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'your-secret-key'
      });
      
      client.data.userId = payload.sub || payload.id;
      
     
      
      // إرسال تأكيد الاتصال للعميل
      client.emit('connected', { 
        status: 'success', 
        userId: client.data.userId 
      });
      
    } catch (err) {
      console.log('❌ Invalid token, disconnecting client:', client.id, err.message);
      client.emit('error', { message: 'Invalid authentication token' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
  } 

  @SubscribeMessage('joinConversation')
  async joinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket
  ) {
    const room = `room_${data.conversationId}`;
    await client.join(room);
    

    
    return { status: 'joined', room };
  }

  @SubscribeMessage('fares')
  async handleFaresMessage(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket
  ) {
 
    
    // معالجة الرسالة
    const response = `Server received: ${data}`;
    
    // الرد على العميل
    return response;
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(
    @MessageBody() data: SendMessageDto,
    @ConnectedSocket() client: Socket
  ) {
    try {
      let imageUrl, voiceUrl;

      if (data.type === MessageType.IMAGE && data.image) {
        imageUrl = await this.cloudinary.uploadImageFromBase64(
          data.image, 
          'chat-images'
        );
      }

      if (data.type === MessageType.VOICE && data.voice) {
        voiceUrl = await this.cloudinary.uploadVoiceFromBase64(
          data.voice, 
          'chat-voices'
        );
      }

      const message = await this.prisma.message.create({
        data: {
          conversationId: data.conversationId,
          senderId: data.senderId,
          text: data.text || null,
          imageUrl: imageUrl || null,
          voice: voiceUrl || null,
          type: data.type || MessageType.TEXT,
        },
      });

      const room = `room_${data.conversationId}`;
      this.server.to(room).emit('newMessage', message);

      

      return { status: 'sent', message };
      
    } catch (error) {
      console.error('❌ Error sending message:', error);
      return { status: 'error', message: error.message };
    }
  }
}
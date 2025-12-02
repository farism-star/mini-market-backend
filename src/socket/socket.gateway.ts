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
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private cloudinary: CloudinaryService,
  ) {}

  @WebSocketServer()
  server: Server;


  async handleConnection(client: Socket) {
    console.log(`🟢 [CONNECT] Client connected: ${client.id}`);

    const token = client.handshake.auth.token as string;

    if (!token) {
      console.log(`❌ [AUTH FAIL] No token for client ${client.id}`);
      return client.disconnect();
    }

    try {
      const payload = await this.jwt.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      client.data.userId = payload.sub || payload.id;

   

      client.emit('connected', {
        status: 'success',
        userId: client.data.userId,
      });
    } catch (err) {
   
      client.emit('error', { message: 'Invalid authentication token' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(
      `🔴 [DISCONNECT] Client disconnected: ${client.id} | User: ${client?.data?.userId}`,
    );
  }
  @SubscribeMessage('joinConversation')
  async joinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
   

      const room = `room_${data.conversationId}`;
      await client.join(room);


      return { status: 'joined', room };
    } catch (err) {
   
      return { status: 'error', message: err.message };
    }
  }

 
  @SubscribeMessage('sendMessage')
  async sendMessage(
    @MessageBody() data: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
  

    try {
      let imageUrl: string | null = null;
      let voiceUrl: string | null = null;

      // IMAGE
      if (data.type === MessageType.IMAGE && data.image) {
    
        imageUrl = await this.cloudinary.uploadImageFromBase64(
          data.image,
          'chat-images',
        );

      }

      // VOICE
      if (data.type === MessageType.VOICE && data.voice) {
  
        voiceUrl = await this.cloudinary.uploadVoiceFromBase64(
          data.voice,
          'chat-voices',
        );
      
      }

      // SAVE MESSAGE IN DATABASE

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
  

      // EMIT TO ROOM
      const room = `room_${data.conversationId}`;
 
      this.server.to(room).emit('newMessage', message);

   

      return { status: 'sent', message };
    } catch (error) {
   
      return { status: 'error', message: error.message };
    }
  }
}

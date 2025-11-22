import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: { origin: '*' }
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Map <userId, socketId>
  private connectedUsers = new Map<string, string>();

  constructor(private jwt: JwtService) {}

  // عند الاتصال
  async handleConnection(client: Socket) {
    const token = client.handshake.auth.token;
    if (!token) return client.disconnect();

    try {
      const payload = await this.jwt.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      // تخزين userId مع socketId
      this.connectedUsers.set(payload.sub, client.id);

    } catch (err) {
      console.log('Invalid token, disconnecting client');
      client.disconnect();
    }
  }

  // عند قطع الاتصال
  async handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        
        break;
      }
    }
  }

  // إرسال notification لمستخدم محدد
  sendNotificationToUser(userId: string, notification: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('newNotification', notification);
    }
  }
}

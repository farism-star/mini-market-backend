import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { PrismaService } from 'src/prisma/prisma.service';

import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_SECRET })],
  providers: [SocketGateway, PrismaService],
  exports: [], 
})
export class SocketModule {}

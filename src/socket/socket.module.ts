import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_SECRET })],
  providers: [SocketGateway, PrismaService, CloudinaryService],
  exports: [], 
})
export class SocketModule {}

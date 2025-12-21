import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { PrismaService } from 'src/prisma/prisma.service';
import { FirebaseService } from '../firbase/firebase.service';
import { FirebaseModule } from 'src/firbase/firebase.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_SECRET }),FirebaseModule],
  providers: [SocketGateway, PrismaService,FirebaseService],
  exports: [], 
})
export class SocketModule {}

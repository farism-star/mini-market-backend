import { Module } from '@nestjs/common';
import { GlobalFeesSettingsController } from './GlobaleFees.controller';
import { GlobalFeesSettingsService } from './GlobaleFees.service';
import { PrismaService } from "../prisma/prisma.service";

@Module({
  
  controllers: [GlobalFeesSettingsController],
  providers: [GlobalFeesSettingsService, PrismaService],
  exports: [GlobalFeesSettingsService], // ← مهم عشان نستخدمه في AuthService
})
export class GlobalFeesModule {}

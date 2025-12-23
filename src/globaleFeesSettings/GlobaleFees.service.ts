import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GlobalFeesSettingsDto } from './dtos/globaleFees.dto';

@Injectable()
export class GlobalFeesSettingsService {
  constructor(private prisma: PrismaService) {}

  
  async getSettings() {
    
    let settings = await this.prisma.globalFeesSettings.findFirst();

   
    if (!settings) {
      settings = await this.prisma.globalFeesSettings.create({
        data: {
          limitFees: 0,
          feePerOrder: 0,
          currentFees: 0,
        },
      });
    }

    return {
      message: 'Settings retrieved successfully',
      settings,
    };
  }

  
  async updateSettings(dto: GlobalFeesSettingsDto) {
    // جلب السجل الحالي
    let settings = await this.prisma.globalFeesSettings.findFirst();

    if (!settings) {
      // إنشاء سجل جديد
      settings = await this.prisma.globalFeesSettings.create({
        data: {
          limitFees: dto.limitFees,
          feePerOrder: dto.feePerOrder,
    
        },
      });
    } else {
      // تحديث السجل الموجود
      settings = await this.prisma.globalFeesSettings.update({
        where: { id: settings.id },
        data: {
          limitFees: dto.limitFees,
          feePerOrder: dto.feePerOrder,
     
        },
      });
    }

    return {
      message: 'Settings updated successfully',
      settings,
    };
  }
}
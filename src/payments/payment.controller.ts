import { Controller, Post, Body, Get, Query,UseGuards,Req } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.gaurd';
import { Roles } from '../auth/Role.decorator';
import { Role } from '../auth/roles.enum';
@Controller(

  {
    path:'payment',
    version:'1'
  }
)
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

@Post('create')
  @Roles(Role.OWNER)
  async initiate(@Req() req: any, @Body() dto: { amount: number }) {
    const ownerId = req.user.id; // بيانات الـ owner من الـ token فقط
    return this.paymentService.initiatePayment(ownerId, dto.amount);
  }

  @Post('callback')
  callback(@Body() clickpayData: any) {
    return this.paymentService.handleCallback(clickpayData);
  }

  @Get('verify')
  verify(@Query('tran_ref') tranRef: string) {
    return this.paymentService.verifyPaymentStatus(tranRef);
  }
}
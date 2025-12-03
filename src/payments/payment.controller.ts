import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller(

  {
    path:'payment',
    version:'1'
  }
)
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('create')
  initiate(@Body() dto: CreatePaymentDto) {
    return this.paymentService.initiatePayment(dto);
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
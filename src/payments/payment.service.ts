import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import * as crypto from 'crypto';
import { PaymentStatus } from '@prisma/client';
@Injectable()
export class PaymentService {
  private readonly CLICKPAY_API_URL = 'https://secure.clickpay.com.sa/payment/request';
  private readonly CLICKPAY_QUERY_URL = 'https://secure.clickpay.com.sa/payment/query';
  private readonly PROFILE_ID = process.env.PROFILE_ID;
  private readonly SERVER_KEY: string;

  constructor(private prisma: PrismaService) {
  if (!process.env.CLICKPAY_SERVER_KEY) {
    throw new Error('CLICKPAY_SERVER_KEY is not defined');
  }

  this.SERVER_KEY = process.env.CLICKPAY_SERVER_KEY;
}


  async initiatePayment(userId: string, amount: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        phone: true,
        isAproved: true,
        isFeesRequired: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const market = await this.prisma.market.findUnique({
      where: { ownerId: userId },
      select: { id: true, nameAr: true, nameEn: true },
    });

    if (!market) throw new NotFoundException('Market not found');

    const payment = await this.prisma.payment.create({
      data: {
        user: { connect: { id: userId } },
        amount,
        method: 'ONLINE',
        status: 'PENDING',
      },
    });

    const paymentRequest = {
      profile_id: this.PROFILE_ID,
      tran_type: 'sale',
      tran_class: 'ecom',
      cart_id: payment.id,
      cart_description: `Payment for market ${market.nameAr || market.nameEn}`,
      cart_currency: 'SAR',
      cart_amount: amount,
      customer_details: {
        name: user.name,
        email: user.email || 'N/A',
        phone: user.phone || 'N/A',
        street1: 'N/A',
        city: 'Riyadh',
        state: 'Riyadh',
        country: 'SA',
        zip: '12345',
      },
      hide_shipping: true,
      framed: false,
    };

    try {
      const response = await axios.post(this.CLICKPAY_API_URL, paymentRequest, {
        headers: {
          Authorization: this.SERVER_KEY,
          'Content-Type': 'application/json',
        },
      });

      const data = response.data;

      if (!data.tran_ref) throw new BadRequestException('ClickPay failed');

      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          clickpayOrderId: data.tran_ref,
          clickpayCartId: data.cart_id,
        },
      });

      return {
        success: true,
        paymentId: payment.id,
        redirectUrl: data.redirect_url,
        data,
      };
    } catch (error) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });

      throw new BadRequestException(error.response?.data || error.message);
    }
  }

 async handleCallback(payload: any) {
  const { tran_ref, cart_id, resp_status, resp_code } = payload;

  if (!this.verifySignature(payload)) {
    throw new BadRequestException('Invalid signature');
  }

  const payment = await this.prisma.payment.findUnique({
    where: { id: cart_id },
  });

  if (!payment) throw new NotFoundException('Payment not found');

  let status: PaymentStatus = PaymentStatus.FAILED;

  if (resp_status === 'A' && resp_code === '100') {
    status = PaymentStatus.SUCCESS;
  }

  await this.prisma.payment.update({
    where: { id: cart_id },
    data: {
      status,
      clickpayOrderId: tran_ref,
      clickpayResponse: JSON.stringify(payload),
    },
  });

  if (status === PaymentStatus.SUCCESS) {
    await this.prisma.user.update({
      where: { id: payment.userId },
      data: {
        isFeesRequired: false,
        isAproved: true,
      },
    });
  }

  return {
    success: true,
    status,
    transactionRef: tran_ref,
  };
}


  async verifyPaymentStatus(tranRef: string) {
    try {
      const response = await axios.post(
        this.CLICKPAY_QUERY_URL,
        {
          profile_id: this.PROFILE_ID,
          tran_ref: tranRef,
        },
        {
          headers: {
            Authorization: this.SERVER_KEY,
            'Content-Type': 'application/json',
          },
        },
      );

      const result = response.data?.payment_result;

      if (!result) {
        return { success: false, status: 'UNKNOWN' };
      }

      if (result.response_status === 'A') {
        return { success: true, status: 'SUCCESS', data: response.data };
      }

      if (result.response_status === 'P') {
        return { success: false, status: 'PENDING', data: response.data };
      }

      return { success: false, status: 'FAILED', data: response.data };
    } catch {
      throw new BadRequestException('Verification failed');
    }
  }

  private verifySignature(data: any): boolean {
    const { tran_ref, cart_id, cart_amount, cart_currency, signature } = data;

    const signatureString = `${this.SERVER_KEY}${tran_ref}${cart_id}${cart_amount}${cart_currency}`;

    const hash = crypto
      .createHmac('sha256', this.SERVER_KEY)
      .update(signatureString)
      .digest('hex')
      .toUpperCase();

    return hash === signature;
  }
}

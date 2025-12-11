import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import * as crypto from 'crypto';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentService {
  private readonly CLICKPAY_API_URL = 'https://secure.clickpay.com.sa/payment/request';
  private readonly CLICKPAY_QUERY_URL = 'https://secure.clickpay.com.sa/payment/query';
  private readonly PROFILE_ID = process.env.PROFILE_ID;
  private readonly SERVER_KEY = process.env.CLICKPAY_SERVER_KEY;

  constructor(private prisma: PrismaService) {}

 async initiatePayment(ownerId: string, amount: number) {
    // جلب بيانات المالك من جدول الـ User
    const owner = await this.prisma.user.findUnique({
      where: { id: ownerId },
      select: {
        name: true,
        email: true,
        phone: true,
        location: true,
        isAproved: true,
        isFeesRequired: true,
      },
    });

    if (!owner) throw new NotFoundException('Owner not found');

    // جلب الماركت الخاص بالمالك
    const market = await this.prisma.market.findUnique({
      where: { ownerId },
      select: { id: true, nameAr: true, nameEn: true },
    });

    if (!market) throw new NotFoundException('Market not found');

    // تحقق إذا فيه مستحقات غير مدفوعة
  

    // إنشاء سجل الدفع
    const payment = await this.prisma.payment.create({
      data: {
        userId: ownerId,
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
        name: owner.name,
        email: owner.email || 'N/A',
        phone: owner.phone || 'N/A',
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
      const clickpayResponse = await axios.post(this.CLICKPAY_API_URL, paymentRequest, {
        headers: {
          Authorization: this.SERVER_KEY,
          'Content-Type': 'application/json',
        },
      });

      const responseData = clickpayResponse.data;

      if (responseData.tran_ref) {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            clickpayOrderId: responseData.tran_ref,
            clickpayCartId: responseData.cart_id,
          },
        });

        return {
          success: true,
          paymentId: payment.id,
          redirectUrl: responseData.redirect_url,
          data:responseData,
          message: 'Please complete your payment to unlock your market.',
        };
      } else {
        throw new BadRequestException('Failed to create payment with ClickPay');
      }
    } catch (error) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });

      throw new BadRequestException(
        `Payment initiation failed: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async handleCallback(clickpayData: any) {
    const {
      tran_ref,
      cart_id,
      resp_status,
      resp_code,
      signature,
    } = clickpayData;

    const isValidSignature = this.verifySignature(clickpayData);
    if (!isValidSignature) {
      throw new BadRequestException('Invalid signature');
    }

    const payment = await this.prisma.payment.findUnique({
      where: { id: cart_id }
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    let newStatus = 'FAILED';
    if (resp_status === 'A' && resp_code === '100') {
      newStatus = 'SUCCESS';
    }

    await this.prisma.payment.update({
      where: { id: cart_id },
      data: {
        status: newStatus,
        clickpayOrderId: tran_ref,
        clickpayResponse: JSON.stringify(clickpayData),
      }
    });

    return {
      success: true,
      message: 'Payment updated',
      status: newStatus,
      transactionRef: tran_ref,
    };
  }

  private verifySignature(data: any): boolean {
    if (!this.SERVER_KEY) {
      throw new BadRequestException('Server key is not configured');
    }

    const {
      tran_ref,
      cart_id,
      cart_amount,
      cart_currency,
      signature,
    } = data;

    const signatureString = `${this.SERVER_KEY}${tran_ref}${cart_id}${cart_amount}${cart_currency}`;
    
    const calculatedSignature = crypto
      .createHmac('sha256', this.SERVER_KEY)
      .update(signatureString)
      .digest('hex')
      .toUpperCase();

    return calculatedSignature === signature;
  }

async verifyPaymentStatus(transactionRef: string) {
  try {
    const response = await axios.post(
      this.CLICKPAY_QUERY_URL,
      {
        profile_id: this.PROFILE_ID,
        tran_ref: transactionRef,
      },
      {
        headers: {
          Authorization: this.SERVER_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = response.data;

    if (!data.payment_result) {
      return {
        success: false,
        status: 'UNKNOWN',
        message: 'No payment result found.',
        raw: data,
      };
    }

    const result = data.payment_result;

    // الحالة الأساسية
    let status = 'FAILED';
    let success = false;
    let userMessage = '';

    if (result.response_status === 'A') {
      status = 'SUCCESS';
      success = true;
      userMessage = 'Your payment was successful 🎉';
    } else if (result.response_status === 'P') {
      status = 'PENDING';
      userMessage = 'Your payment is still pending ⏳';
    } else {
      status = 'FAILED';
      userMessage = `Payment failed ❌: ${result.response_message || 'Unknown error'}`;
    }

    return {
      success,
      status,
      amount: data.tran_total,
      transactionRef: data.tran_ref,
      message: userMessage,
      reason: result.acquirer_message || result.response_message,
      method: data.payment_info?.payment_method,
      card: data.payment_info?.payment_description,
      bank: data.payment_info?.issuerName,
      time: result.transaction_time,
    };

  } catch (error) {
    throw new BadRequestException('Failed to verify payment status');
  }
}

}
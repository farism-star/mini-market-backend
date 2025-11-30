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
  private readonly SERVER_KEY = process.env.CLICKPAY_SERVER_KEY_TEST;

  constructor(private prisma: PrismaService) {}

  async initiatePayment(dto: CreatePaymentDto) {
    const payment = await this.prisma.payment.create({
      data: {
        userId: dto.userId,
        amount: dto.amount,
        method: dto.method,
        status: 'PENDING'
      }
    });

    const paymentRequest = {
      profile_id: this.PROFILE_ID,
      tran_type: 'sale',
      tran_class: 'ecom',
      cart_id: payment.id,
      cart_description: `Payment for order ${payment.id}`,
      cart_currency: 'SAR',
      cart_amount: dto.amount,
      customer_details: {
        name: dto.customerName,
        email: dto.customerEmail,
        phone: dto.customerPhone,
        street1: dto.customerAddress || 'N/A',
        city: dto.customerCity || 'Riyadh',
        state: dto.customerState || 'Riyadh',
        country: 'SA',
        zip: dto.customerZip || '12345',
      },
      hide_shipping: true,
      framed: false,
    };

    try {
      
      
      const clickpayResponse = await axios.post(
        this.CLICKPAY_API_URL,
        paymentRequest,
        {
          headers: {
            'Authorization': this.SERVER_KEY,
            'Content-Type': 'application/json',
          },
        }
      );

      const responseData = clickpayResponse.data;
      

      if (responseData.tran_ref) {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            clickpayOrderId: responseData.tran_ref,
            clickpayCartId: responseData.cart_id,
          }
        });

        return {
          success: true,
          paymentId: payment.id,
          redirectUrl: responseData.redirect_url,
        };
      } else {
        throw new BadRequestException('Failed to create payment with ClickPay');
      }
    } catch (error) {
      console.log('Error Response:', error.response?.data);
      
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' }
      });

      throw new BadRequestException(
        `Payment initiation failed: ${error.response?.data?.message || error.message}`
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
            'Authorization': this.SERVER_KEY,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      throw new BadRequestException('Failed to verify payment status');
    }
  }
}
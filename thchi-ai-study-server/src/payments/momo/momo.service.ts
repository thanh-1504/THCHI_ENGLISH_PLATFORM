import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import crypto from 'crypto';

@Injectable()
export class MomoService {
  private momoConfig: any;
  constructor(private readonly configService: ConfigService) {
    this.momoConfig = {
      partnerCode: this.configService.get<string>('MOMO_PARTNER_CODE'),
      accessKey: this.configService.get<string>('MOMO_ACCESS_KEY'),
      secretKey: this.configService.get<string>('MOMO_SECRET_KEY'),
      apiUrl: this.configService.get<string>('MOMO_API_URL'),
      redirectUrl: this.configService.get<string>('MOMO_REDIRECT_URL'),
      ipnUrl: this.configService.get<string>('MOMO_IPN_URL'),
    };
  }

  private createSignature(rawSignature: string) {
    return crypto
      .createHmac('sha256', this.momoConfig.secretKey)
      .update(rawSignature)
      .digest('hex');
  }

  async createPayment(orderId: string, amount: number, orderInfo: string) {
    const requestId = orderId;
    const extraData = '';
    const requestType = 'captureWallet';
    const rawSignature =
      'accessKey=' +
      this.momoConfig.accessKey +
      '&amount=' +
      amount +
      '&extraData=' +
      extraData +
      '&ipnUrl=' +
      this.momoConfig.ipnUrl +
      '&orderId=' +
      orderId +
      '&orderInfo=' +
      orderInfo +
      '&partnerCode=' +
      this.momoConfig.partnerCode +
      '&redirectUrl=' +
      this.momoConfig.redirectUrl +
      '&requestId=' +
      requestId +
      '&requestType=' +
      requestType;
    const signature = this.createSignature(rawSignature);
    const requestBody = {
      partnerCode: this.momoConfig.partnerCode,
      accessKey: this.momoConfig.accessKey,
      requestId: requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl: this.momoConfig.redirectUrl,
      ipnUrl: this.momoConfig.ipnUrl,
      extraData,
      requestType,
      signature,
      lang: 'en',
    };
    try {
      const res = await axios.post(this.momoConfig.apiUrl, requestBody);
      return res.data;
    } catch (error) {
      console.log(error);
      throw new Error(`Lỗi thanh toán Momo: ${error.message}`);
    }
  }

  verifyIpn(body: any): boolean {
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
    } = body;

    const rawSignature = `accessKey=${this.momoConfig.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

    const expectedSignature = this.createSignature(rawSignature);
    return signature === expectedSignature;
  }
}

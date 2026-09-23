import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { Public } from 'src/shared/decorators/public.decorator';
import { CreatePaymentVnPayDTO } from './dto/create-payment.dto';
import { VNPayService } from './vnpay.service';

@Controller('vnpay')
export class VNPayController {
  constructor(
    private readonly vnpayService: VNPayService,
    private readonly configService: ConfigService,
  ) {}

  @Post('create-payment')
  createPaymentUrl(@Body() createPaymentVnPayDTO: CreatePaymentVnPayDTO) {
    return this.vnpayService.createPayment(
      createPaymentVnPayDTO.amount,
      createPaymentVnPayDTO.orderId,
      createPaymentVnPayDTO.orderInfo,
    );
  }

  @Public()
  @Get('verify')
  async returnUrl(
    @Query() query: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const verifyResult = await this.vnpayService.verifyPayment(query);

    if (verifyResult.isSuccess) {
      return res.redirect(
        `${this.configService.get<string>('CLIENT_URL')}/payment/result?isSuccess=${verifyResult.isSuccess}`,
      );
    } else {
      return res.redirect(
        `${this.configService.get<string>('CLIENT_URL')}/payment/result?isSuccess=${verifyResult.isSuccess}`,
      );
    }
  }
}

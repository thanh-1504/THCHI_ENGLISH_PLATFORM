import { Body, Controller, Post } from '@nestjs/common';
import { CreatePaymentMomoDTO } from './dto/create-payment.schema';
import { MomoService } from './momo.service';

@Controller('momo')
export class MomoController {
  constructor(private readonly momoService: MomoService) {}

  @Post('create-payment')
  createPayment(@Body() body: CreatePaymentMomoDTO) {
    return this.momoService.createPayment(
      body.orderId,
      body.amount,
      body.orderInfo,
    );
  }

  @Post('ipn')
  async handleIpn(@Body() body: any) {
    console.log('Nhận dữ liệu IPN từ MoMo:', body);
    const isValid = this.momoService.verifyIpn(body);
    if (!isValid) {
      console.error('Chữ ký MoMo IPN không hợp lệ!');
      return;
    }
    if (body.resultCode === 0) {
      console.log(
        `Đơn hàng ${body.orderId} đã thanh toán thành công qua MoMo.`,
      );
    } else {
      console.log(
        `Đơn hàng ${body.orderId} thanh toán thất bại. Mã lỗi: ${body.resultCode}`,
      );
    }
    return; 
  }
}

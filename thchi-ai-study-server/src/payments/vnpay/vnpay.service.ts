import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TransactionStatus } from 'generated/prisma/enums';
import { TransactionService } from 'src/transaction/transaction.service';
import { HashAlgorithm, VNPay, ignoreLogger } from 'vnpay';

@Injectable()
export class VNPayService {
  private readonly vnpay: VNPay;
  constructor(
    private readonly configService: ConfigService,
    private readonly transactionService: TransactionService,
  ) {
    this.vnpay = new VNPay({
      tmnCode: this.configService.get<string>('VNPAY_TMN_CODE') as string,
      secureSecret: this.configService.get<string>(
        'VNPAY_HASH_SECRET',
      ) as string,
      vnpayHost: 'https://sandbox.vnpayment.vn',
      testMode: true,
      hashAlgorithm: HashAlgorithm.SHA512,
      enableLog: true,
      loggerFn: ignoreLogger,
    });
  }

  async createPayment(amount: number, orderId: string, orderInfo: string) {
    const paymentUrl = this.vnpay.buildPaymentUrl({
      vnp_Amount: amount,
      vnp_IpAddr: '192.168.1.1',
      vnp_ReturnUrl: this.configService.get<string>(
        'VNPAY_REDIRECT_URL',
      ) as string,
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
    });
    return paymentUrl;
  }

  async verifyPayment(queryString: any) {
    const { vnp_PayDate, vnp_TxnRef } = queryString;
    const verify = this.vnpay.verifyReturnUrl(queryString);
    const payDate = new Date(
      vnp_PayDate.replace(
        /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/,
        '$1-$2-$3T$4:$5:$6',
      ),
    );
    if (verify.isSuccess) {
      this.transactionService.update({
        id: vnp_TxnRef,
        payDate,
        status: TransactionStatus.SUCCESS,
      });
    } else {
      this.transactionService.update({
        id: vnp_TxnRef,
        payDate,
        status: TransactionStatus.FAILED,
      });
    }
    return verify;
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PremiumDuration, TransactionStatus } from 'generated/prisma/enums';
import { SepayWebhookType } from 'src/payments/sepay/schema/sepay.webhook.schema';
import { PremiumRepo } from 'src/premium/repos/premium.repo';
import { PaymentGateway } from 'src/websocket/payment.gateway';
import { TransactionRepo } from './repo/transaction.repo';
import { CreateTransactionType } from './schemas/transaction.schema';

@Injectable()
export class TransactionService {
  constructor(
    private readonly transactionRepo: TransactionRepo,
    private readonly premiumRepo: PremiumRepo,
    private readonly paymentGateway: PaymentGateway,
    private readonly configService: ConfigService,
  ) {}

  private buildQrUrl(amount: number, paymentCode: string) {
    const account = this.configService.get<string>('SEPAY_ACCOUNT_NUMBER');
    const bank = this.configService.get<string>('SEPAY_BANK_CODE');
    const qrUrl = `https://qr.sepay.vn/img?acc=${account}&bank=${bank}&amount=${amount}&des=${paymentCode}`;
    return qrUrl;
  }

  private extractPaymentCode(content: string) {
    const match = content.match(/SEVQR.*/i);
    return match ? match[0].trim().toUpperCase() : '';
  }

  async processWebhook(payload: SepayWebhookType) {
    const paymentCode = this.extractPaymentCode(payload.content);
    const amountReceied = payload.transferAmount;
    const transaction = await this.transactionRepo.findOne({
      paymentCode: paymentCode,
    });
    if (!transaction || transaction.status !== TransactionStatus.PENDING) {
      return { success: false };
    }

    if (+transaction.amount !== amountReceied) {
      return { success: false };
    }
    await this.update({
      id: transaction.id,
      payDate: new Date(),
      status: TransactionStatus.SUCCESS,
    });
    this.paymentGateway.emitPaymentSuccess(transaction.id, {
      transactionId: transaction.id,
      amount: transaction.amount,
    });
    return { success: true };
  }

  async getTransactionsHistory(userId: string) {
    return await this.transactionRepo.getTransactionsHistory(userId);
  }

  async findOne(id: string, userId: string) {
    const transaction = await this.transactionRepo.findOneDetail(id);
    if (!transaction) throw new NotFoundException('Không tìm thấy giao dịch');
    if (transaction.userId !== userId) throw new UnauthorizedException();
    return transaction;
  }

  async create(userId: string, createTransactionDto: CreateTransactionType) {
    const [isSubscription, isPending] = await Promise.all([
      this.transactionRepo.checkIsSubscription(userId),
      this.transactionRepo.checkTransactionPending(userId),
    ]);
    if (isSubscription?.isActive) {
      const now = new Date();
      if (isSubscription.endDate && isSubscription.endDate > now) {
        throw new BadRequestException(
          `Bạn đang có gói Premium còn hạn đến ${isSubscription.endDate.toLocaleDateString('vi-VN')}. Vui lòng đợi hết hạn mới gia hạn.`,
        );
      }
    }
    if (isPending)
      throw new BadRequestException(
        'Bạn có giao dịch chưa hoàn thành. Vui lòng hoàn tất hoặc hủy giao dịch cũ.',
      );
    const transaction = await this.transactionRepo.create(
      userId,
      createTransactionDto,
    );
    const qrURL = this.buildQrUrl(+transaction.amount, transaction.paymentCode);
    return {
      qrURL,
      transaction,
    };
  }

  async update(payload: {
    id: string;
    payDate: Date;
    status: TransactionStatus;
  }) {
    const transaction = await this.transactionRepo.findOne({ id: payload.id });
    if (!transaction) throw new NotFoundException('Không tìm thấy giao dịch');

    if (payload.status === TransactionStatus.FAILED) {
      return await this.transactionRepo.updateStatus(
        payload.id,
        TransactionStatus.FAILED,
      );
    }
    const planSubscription = await this.premiumRepo.findOne(transaction.planId);
    if (!planSubscription)
      throw new NotFoundException('Không tìm thấy gói premium này');
    let endDate;
    switch (planSubscription.duration) {
      case PremiumDuration.THREE_MONTHS:
        endDate = new Date(
          payload.payDate.getTime() + 1000 * 60 * 60 * 24 * 90,
        );
        break;
      case PremiumDuration.ONE_YEAR:
        endDate = new Date(
          payload.payDate.getTime() + 1000 * 60 * 60 * 24 * 365,
        );
        break;
    }

    return await this.transactionRepo.update({
      userId: transaction.userId,
      id: payload.id,
      startDate: payload.payDate,
      endDate,
      status: payload.status,
    });
  }
}

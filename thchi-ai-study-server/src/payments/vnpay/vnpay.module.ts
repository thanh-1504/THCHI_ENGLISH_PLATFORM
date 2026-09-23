import { Module } from '@nestjs/common';
import { TransactionModule } from 'src/transaction/transaction.module';
import { VNPayController } from './vnpay.controller';
import { VNPayService } from './vnpay.service';

@Module({
  imports: [TransactionModule],
  controllers: [VNPayController],
  providers: [VNPayService],
})
export class VNPayModule {}

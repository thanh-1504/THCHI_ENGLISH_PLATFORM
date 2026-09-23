import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TransactionModule } from 'src/transaction/transaction.module';
import { SepayController } from './sepay.controller';

@Module({
  imports: [TransactionModule, ConfigModule],
  controllers: [SepayController],
  providers: [],
})
export class SepayModule {}

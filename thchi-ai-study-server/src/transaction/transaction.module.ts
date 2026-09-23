import { Module } from '@nestjs/common';
import { PremiumRepo } from 'src/premium/repos/premium.repo';
import { WebsocketModule } from 'src/websocket/websocket.module';
import { TransactionRepo } from './repo/transaction.repo';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';

@Module({
  imports: [WebsocketModule],
  controllers: [TransactionController],
  providers: [TransactionService, TransactionRepo, PremiumRepo],
  exports: [TransactionService],
})
export class TransactionModule {}

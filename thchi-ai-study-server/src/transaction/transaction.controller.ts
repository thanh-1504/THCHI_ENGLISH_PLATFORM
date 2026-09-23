import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { User } from 'src/shared/decorators/user.decorator';
import { CreateTransactionDto } from './dtos/create-transaction.dto';
import { TransactionService } from './transaction.service';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('/history')
  getTransactionsHistory(@User('id') userId: string) {
    return this.transactionService.getTransactionsHistory(userId);
  }

  @Get('/:id')
  getDetailTransaction(@Param('id') id: string, @User('id') userId: string) {
    return this.transactionService.findOne(id, userId);
  }

  @Post()
  create(
    @User('id') userId: string,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    return this.transactionService.create(userId, createTransactionDto);
  }
}

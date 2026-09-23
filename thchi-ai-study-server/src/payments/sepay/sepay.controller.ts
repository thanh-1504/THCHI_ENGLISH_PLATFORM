import {
  Body,
  Controller,
  Headers,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Public } from 'src/shared/decorators/public.decorator';
import { TransactionService } from 'src/transaction/transaction.service';
import { SepayWebhookDTO } from './dto/sepay.webhook.dto';

@Controller('webhooks/sepay')
export class SepayController {
  constructor(
    private configService: ConfigService,
    private transactionService: TransactionService,
  ) {}

  @Public()
  @Post()
  async handleSepayWebhook(
    @Body() payload: SepayWebhookDTO,
    @Headers('authorization') auth: string,
  ) {
    if (auth !== `Apikey ${this.configService.get<string>('SEPAY_API_KEY')}`)
      throw new UnauthorizedException();
    return await this.transactionService.processWebhook(payload);
  }
}

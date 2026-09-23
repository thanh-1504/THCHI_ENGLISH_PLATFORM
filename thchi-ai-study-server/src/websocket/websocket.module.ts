import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { NotificationGateway } from './notification.gateway';
import { PaymentGateway } from './payment.gateway';
import { WsAuthGuard } from './ws-auth.guard';

@Module({
  imports: [JwtModule.register({})],
  providers: [NotificationGateway, WsAuthGuard, PaymentGateway],
  exports: [NotificationGateway, PaymentGateway],
})
export class WebsocketModule {}

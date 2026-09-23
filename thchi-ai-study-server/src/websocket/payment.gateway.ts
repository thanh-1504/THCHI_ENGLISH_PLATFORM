import { Logger, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsAuthGuard } from './ws-auth.guard';
@WebSocketGateway()
export class PaymentGateway {
  private readonly logger = new Logger(PaymentGateway.name);
  constructor() {}

  @WebSocketServer()
  server: Server;

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('payment:join')
  handleJoinPaymentRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { transactionId: string },
  ) {
    client.join(`payment-${data.transactionId}`);
    this.logger.log(
      `User ${client.id} joined payment room ${data.transactionId}`,
    );
  }

  emitPaymentSuccess(transactionId: string, data: any) {
    return this.server
      .to(`payment-${transactionId}`)
      .emit('payment:success', data);
  }

  emitPaymentFailed(transactionId: string, data: any) {
    return this.server
      .to(`payment-${transactionId}`)
      .emit('payment:failed', data);
  }
}

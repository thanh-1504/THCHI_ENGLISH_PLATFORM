import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', process.env.CLIENT_URL].filter(Boolean),
    credentials: true,
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private parseCookie(cookieStr: string, key: string): string | undefined {
    if (!cookieStr) return undefined;
    const match = cookieStr
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${key}=`));
    return match ? decodeURIComponent(match.split('=')[1]) : undefined;
  }

  handleConnection(client: Socket) {
    const token =
      client.handshake.auth?.accessToken ??
      client.handshake.headers?.authorization?.split(' ')[1] ??
      this.parseCookie(client.handshake.headers?.cookie as string, 'accessToken') ??
      '';

    if (!token) {
      this.logger.warn(`Socket ${client.id} thiếu token`);
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      const userId = payload.id;

      client.data.userId = userId;
      client.join(`user-${userId}`);
      this.logger.log(`User ${userId} connected to socket ${client.id}`);
    } catch (error) {
      this.logger.warn(`Socket ${client.id} verify token thất bại: ${error.message}`);
      client.disconnect();
      return;
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Socket ${client.id} disconnected`);
  }

  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user-${userId}`).emit(event, data);
  }
}
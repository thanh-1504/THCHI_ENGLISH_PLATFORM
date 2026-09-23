import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class WsAuthGuard implements CanActivate {
  private readonly logger = new Logger(WsAuthGuard.name);
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

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient();

    // Ưu tiên: auth.accessToken (login mới) → Authorization header → cookie (reload trang)
    const token =
      client.handshake.auth?.accessToken ??
      client.handshake.headers?.authorization?.split(' ')[1] ??
      this.parseCookie(
        client.handshake.headers?.cookie as string,
        'accessToken',
      ) ??
      '';

    if (!token) {
      this.logger.warn(`Socket ${client.id} thiếu token`);
      return false;
    }
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      client.data.userId = payload.sub;
      return true;
    } catch (error) {
      this.logger.error(`Socket ${client.id} không thể xác thực`, error);
      return false;
    }
  }
}

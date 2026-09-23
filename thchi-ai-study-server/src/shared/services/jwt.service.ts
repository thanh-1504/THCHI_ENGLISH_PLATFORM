import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenPayload, RefreshTokenPayload } from '../interfaces/IUser';

@Injectable()
export class JWTService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  decodeToken(token: string) {
    return this.jwtService.decode(token);
  }

  signAccessToken(payload: AccessTokenPayload) {
    const token = this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') as any,
    });
    return token;
  }
  signRefreshToken(payload: RefreshTokenPayload) {
    const token = this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>(
        'JWT_REFRESH_TOKEN_EXPIRES_IN',
      ) as any,
    });
    return token;
  }

  signResetToken(payload: { email: string }) {
    const token = this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_RESET_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('JWT_RESET_EXPIRES_IN') as any,
    });
    return token;
  }

  verifyAccessToken(token: string) {
    return this.jwtService.verify(token);
  }

  verifyRefreshToken(token: string) {
    return this.jwtService.verify(token, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
    });
  }

  verifyResetToken(token: string) {
    return this.jwtService.verify(token, {
      secret: this.configService.get<string>('JWT_RESET_TOKEN_SECRET'),
    });
  }
}

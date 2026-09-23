import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RedisService } from 'src/shared/services/redis.service';

const extractToken = ExtractJwt.fromExtractors([
  (request: Request) => request?.cookies?.['accessToken'],
  ExtractJwt.fromAuthHeaderAsBearerToken(),
]);

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly redisService: RedisService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.['accessToken'];
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey: process.env.JWT_SECRET as string,
    });
  }

  async validate(req: Request, payload: any) {
  const token = extractToken(req);

  try {
    const isBlacklisted = await this.redisService.client.exists(`auth:blacklist:${token}`);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token này không còn hiệu lực');
    }
  } catch (err) {
    if (err instanceof UnauthorizedException) throw err; 
    console.error('Redis blacklist check failed, allowing request:', err.message);
  }

  return { id: payload.id, email: payload.email, username: payload.name, role: payload.role, status: payload.status };
}
}

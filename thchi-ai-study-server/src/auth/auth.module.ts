import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from 'src/shared/modules/mail.module';
import { OtpModule } from 'src/shared/modules/otp.module';
import { JWTService } from 'src/shared/services/jwt.service';
import { OauthRepo } from 'src/user/repos/oauth.repo';
import { UserRepository } from 'src/user/repos/user.repo';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleOauthStrategy } from './strategies/google.strategy.ts';
import { JwtStrategy } from './strategies/jwt.strategy';
import { StreakGoalRepository } from 'src/user/repos/streak-goal.repo';
console.log(process.env.JWT_SECRET);
@Module({
  imports: [
    UserModule,
    MailModule,
    OtpModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') as any,
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') as any,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    UserRepository,
    StreakGoalRepository,
    JWTService,
    JwtStrategy,
    GoogleOauthStrategy,
    OauthRepo,
  ],
})
export class AuthModule {}

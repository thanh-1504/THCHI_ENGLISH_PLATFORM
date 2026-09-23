import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import {
  AccountStatus,
  AuthProvider,
  OtpType,
  Role,
} from 'generated/prisma/enums';
import { AccessTokenPayload, GoogleUser } from 'src/shared/interfaces/IUser';
import { SendOtpType, VerifyOtpType } from 'src/shared/schemas/otp.schema';
import { HashingService } from 'src/shared/services/hashing.service';
import { JWTService } from 'src/shared/services/jwt.service';
import { MailService } from 'src/shared/services/mail.service';
import { OtpService } from 'src/shared/services/otp.service';
import { RedisService } from 'src/shared/services/redis.service';
import { OauthRepo } from 'src/user/repos/oauth.repo';
import { UserRepository } from 'src/user/repos/user.repo';
import type { LoginDto } from './schemas/login.schema';
import type { RegisterDto } from './schemas/register.schema';
import { ResetPasswordType } from './schemas/reset.password.schema';
@Injectable()
export class AuthService {
  private isProd: any = '';
  constructor(
    private readonly userRepo: UserRepository,
    private readonly oauthRepo: OauthRepo,
    private readonly hashingService: HashingService,
    private readonly jwtService: JWTService,
    private readonly otpService: OtpService,
    private readonly mailService: MailService,
    private readonly redisClient: RedisService,
    private readonly configService: ConfigService,
  ) {
    this.isProd = this.configService.get<string>('NODE_ENV') === 'production';
  }

  public async blacklistToken(token: string) {
    const clientRedis = this.redisClient.client;
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const decodedToken = this.jwtService.decodeToken(token);
    const ttl = decodedToken.exp - nowInSeconds;
    if (ttl > 0)
      return await clientRedis.set(`auth:blacklist:${token}`, '1', 'EX', ttl);
  }

  async generateTokens(user: AccessTokenPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAccessToken(user),
      this.jwtService.signRefreshToken({ id: user.id }),
    ]);
    return { accessToken, refreshToken };
  }

  async sendOtp(payload: SendOtpType) {
    const { email, type } = payload;
    const otp = await this.otpService.createOTP({
      email,
      type,
    });
    await this.mailService.sendOTPCodeToEmail(email, otp);
    return { message: 'Vui lòng kiểm tra email để lấy mã OTP' };
  }

  async verifyOTP(payload: VerifyOtpType) {
    const { email, type, code } = payload;
    await this.otpService.verifyOtp({
      email,
      type,
      code,
    });
    let resetToken: string | null = null;
    if (type === OtpType.FORGOT_PASSWORD)
      resetToken = await this.jwtService.signResetToken({ email });
    await this.otpService.deleteOtp({ email, type });
    this.otpService.resetRateLimit(email, type);
    return {
      message: 'Xác thực mã otp thành công',
      ...(resetToken && { token: resetToken }),
    };
  }

  async register(registerDto: RegisterDto, res: Response) {
    const { name, email, password } = registerDto;
    const user = await this.userRepo.findUserByEmail(email);
    if (user) throw new BadRequestException('Email này đã tồn tại rồi bạn ơi');
    const newUser = await this.userRepo.registerUser({
      name,
      email,
      password: await this.hashingService.hashPassword(password),
    });
    const { accessToken, refreshToken } = await this.generateTokens({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
    });
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: this.isProd ? true : false,
      sameSite: this.isProd ? 'none' : 'lax',
      maxAge: 60 * 60 * 1000,
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: this.isProd ? true : false,
      sameSite: this.isProd ? 'none' : 'lax',
      maxAge: 60 * 60 * 24 * 7 * 1000,
    });
    return { message: 'Đăng ký tài khoản thành công' };
  }

  async login(loginDto: LoginDto, res: Response) {
    const { email, password, isAdminPage } = loginDto;
    const user = await this.userRepo.findUserByEmail(email);

    if (!user) {
      throw new BadRequestException('Email chưa tồn tại trong hệ thống');
    }

    if (!user.password) {
      throw new BadRequestException(
        'Tài khoản này đăng nhập bằng Google. Vui lòng dùng nút Đăng nhập Google',
      );
    }

    if (user.status !== AccountStatus.ACTIVE) {
      throw new BadRequestException(
        'Tài khoản bị khóa hoặc không hoạt động. Vui lòng liên hệ quản trị viên',
      );
    }

    if (isAdminPage && user.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập vào trang quản trị',
      );
    }

    const correctPassword = await this.hashingService.comparePassword(
      password,
      user.password,
    );
    if (!correctPassword) {
      throw new BadRequestException('Mật khẩu không chính xác');
    }

    const { accessToken, refreshToken } = await this.generateTokens({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: this.isProd ? true : false,
      sameSite: this.isProd ? 'none' : 'lax',
      maxAge: 60 * 60 * 1000,
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: this.isProd ? true : false,
      sameSite: this.isProd ? 'none' : 'lax',
      maxAge: 60 * 60 * 24 * 7 * 1000,
    });

    return { message: 'Đăng nhập thành công', accessToken, refreshToken };
  }

  async getMe(user: AccessTokenPayload) {
    const existUser = await this.userRepo.getMe(user.email);
    if (!existUser) throw new UnauthorizedException('User không tồn tại');

    const now = new Date();
    const sub = existUser.subscription;
    const accountPremium =
      (sub?.isActive === true && sub?.endDate != null && sub.endDate > now) ??
      false;

    return {
      id: existUser.id,
      name: existUser.name,
      email: existUser.email,
      role: existUser.role,
      avatarUrl: existUser.profile?.avatarUrl,
      avatarPublicId: existUser.profile?.avatarPublicId ?? '',
      createdAt: existUser.createdAt ?? '',
      accountPremium,
      subscriptionEndDate: sub?.endDate ?? null,
    };
  }

  async resetPassword(payload: ResetPasswordType) {
    let email: string;
    try {
      const decoded = this.jwtService.verifyResetToken(payload.token);
      email = decoded.email;
    } catch {
      throw new UnauthorizedException(
        'Reset token không hợp lệ hoặc đã hết hạn',
      );
    }
    await this.userRepo.updateUser(
      { email },
      {
        password: await this.hashingService.hashPassword(payload.password),
      },
    );
    return { message: 'Đặt lại mật khẩu thành công' };
  }

  async refreshToken(rfToken: string, res: Response) {
    let payload: { id: string };

    try {
      payload = this.jwtService.verifyRefreshToken(rfToken);
    } catch (err) {
      throw new UnauthorizedException(
        'Refresh token không hợp lệ hoặc đã hết hạn',
      );
    }

    const user = await this.userRepo.findUserByIdOrEmail({ id: payload.id });
    if (!user) throw new UnauthorizedException('User không tồn tại');
    if (
      user.status === AccountStatus.INACTIVE ||
      user.status === AccountStatus.BANNED
    )
      throw new UnauthorizedException('Tài khoản bị khóa hoặc không hoạt động');

    const { accessToken, refreshToken } = await this.generateTokens({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: this.isProd ? true : false,
      sameSite: this.isProd ? 'none' : 'lax',
      maxAge: 60 * 60 * 1000,
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: this.isProd ? true : false,
      sameSite: this.isProd ? 'none' : 'lax',
      maxAge: 60 * 60 * 24 * 7 * 1000,
    });
    return { accessToken, refreshToken };
  }

  async findOrCreateGoogleUser(payload: GoogleUser) {
    const googleAccount = await this.oauthRepo.findByProviderAndProviderId(
      AuthProvider.GOOGLE,
      payload.googleId,
    );
    if (googleAccount) {
      const user = await this.userRepo.findUserByIdOrEmail({
        id: googleAccount.userId,
      });
      if (user)
        return this.generateTokens({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          avatarUrl: payload.avatar,
        });
    } else {
      let user = await this.userRepo.findUserByIdOrEmail({
        email: payload.email,
      });
      if (user) {
        await Promise.all([
          this.oauthRepo.create({
            userId: user.id,
            provider: AuthProvider.GOOGLE,
            providerUid: payload.googleId,
          }),
          this.userRepo.updateUser(
            { id: user.id },
            { avatarUrl: payload.avatar },
          ),
        ]);
      } else {
        user = await this.userRepo.createGoogleAccount({
          googleId: payload.googleId,
          name: payload.name,
          email: payload.email,
          avatar: payload.avatar,
        });
      }
      return this.generateTokens({
        name: user.name,
        email: user.email,
        role: user.role,
        id: user.id,
        status: user.status,
      });
    }
  }
}

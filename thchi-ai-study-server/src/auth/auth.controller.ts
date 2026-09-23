import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AccountStatus } from 'generated/prisma/enums';
import { ZodSerializerDto } from 'nestjs-zod';
import { Public } from 'src/shared/decorators/public.decorator';
import { VerifyOtpDTO } from 'src/shared/dtos/otp.dto';
import { JWTService } from 'src/shared/services/jwt.service';
import { AuthService } from './auth.service';
import {
  LoginDTO,
  LoginResponseDTO,
  RegisterDTO,
  ResetPasswordDTO,
  SendOTPDTO,
} from './dto/auth.dto';
import { GoogleOauthGuard } from './guards/google-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly jwtService: JWTService,
  ) {}

  @Public()
  @Post('/register')
  register(
    @Body() registerDto: RegisterDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.register(registerDto, res);
  }

  @Public()
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(LoginResponseDTO)
  login(@Body() loginDTO: LoginDTO, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(loginDTO, res);
  }

  // @Public()
  // @Post('/admin/login')
  // @HttpCode(HttpStatus.OK)
  // @ZodSerializerDto(LoginResponseDTO)
  // adminLogin(
  //   @Body() loginDTO: LoginDTO,
  //   @Res({ passthrough: true }) res: Response,
  // ) {
  //   return this.authService.login(loginDTO, res);
  // }

  @Post('/logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.accessToken;

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    if (token) {
      await this.authService.blacklistToken(token);
    }

    return { message: 'Đăng xuất thành công' };
  }

  @Public()
  @Post('/refresh-token')
  @HttpCode(HttpStatus.OK)
  refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    return this.authService.refreshToken(refreshToken, res);
  }

  @Public()
  @Post('/send-otp')
  sendOtp(@Body() sendOtpDTO: SendOTPDTO) {
    return this.authService.sendOtp(sendOtpDTO);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('/verify-otp')
  verifyOtp(@Body() verifyOtpDto: VerifyOtpDTO) {
    return this.authService.verifyOTP(verifyOtpDto);
  }

  @Public()
  @UseGuards(GoogleOauthGuard)
  @Get('google')
  googleLogin() {}

  @Public()
  @Post('/reset-password')
  resetPassword(@Body() resetPasswordDTO: ResetPasswordDTO) {
    return this.authService.resetPassword(resetPasswordDTO);
  }

  @Public()
  @UseGuards(GoogleOauthGuard)
  @Get('google-callback')
  googleAuthCallback(@Req() req: any, @Res() res: any) {
    const { accessToken, refreshToken } = req.user;
    const decodedUser = this.jwtService.decodeToken(accessToken);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    if (
      decodedUser.status === AccountStatus.INACTIVE ||
      decodedUser.status === AccountStatus.BANNED
    ) {
      const errorMessage = encodeURIComponent(
        'Tài khoản bị khóa hoặc không hoạt động. Vui lòng liên hệ quản trị viên',
      );
      return res.redirect(`${frontendUrl}/login?error=${errorMessage}`);
    }

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000,
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 * 1000,
    });
    res.redirect(`${frontendUrl}/review`);
  }

  @Get('/me')
  getMe(@Req() req: any) {
    return this.authService.getMe(req.user);
  }
}

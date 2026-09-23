import { BadRequestException, Injectable, } from '@nestjs/common';
import { randomInt } from 'crypto';
import { OtpType } from 'generated/prisma/enums';
import { OtpRepo } from '../repos/otp.repo';

const OTP_RATE_LIMIT = 4; 
const OTP_WINDOW_MS = 10 * 60 * 1000; 

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

@Injectable()
export class OtpService {
  constructor(private readonly otpRepo: OtpRepo) {}

  private readonly sendRateMap = new Map<string, RateLimitEntry>();

  private getRateLimitKey(email: string, type: OtpType): string {
    return `${email}|${type}`;
  }

  private checkAndIncrementRateLimit(email: string, type: OtpType): void {
    const key = this.getRateLimitKey(email, type);
    const now = Date.now();
    const entry = this.sendRateMap.get(key);

    if (!entry || now - entry.windowStart >= OTP_WINDOW_MS) {
      this.sendRateMap.set(key, { count: 1, windowStart: now });
      return;
    }

    if (entry.count >= OTP_RATE_LIMIT) {
      const remainSec = Math.ceil(
        (OTP_WINDOW_MS - (now - entry.windowStart)) / 1000,
      );
      throw new BadRequestException (
        `Bạn đã gửi OTP quá ${OTP_RATE_LIMIT} lần. Vui lòng thử lại sau ${remainSec} giây.`,
      );
    }

    entry.count += 1;
    this.sendRateMap.set(key, entry);
  }

  resetRateLimit(email: string, type: OtpType): void {
    this.sendRateMap.delete(this.getRateLimitKey(email, type));
  }

  private generateOtp() {
    return randomInt(0, 999999).toString().padStart(6, '0');
  }

  async createOTP(payload: { email: string; type: OtpType }) {
    const { email, type } = payload;
    this.checkAndIncrementRateLimit(email, type);

    const code = this.generateOtp();
    await this.otpRepo.createOTP({
      email,
      code,
      type,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    return code;
  }

  async verifyOtp(payload: { email: string; type: OtpType; code: string }) {
    const { email, type, code } = payload;
    const existOtp = await this.otpRepo.findOtpByEmailAndType({ email, type });
    if (!existOtp) throw new BadRequestException('Mã OTP không tồn tại');
    if (existOtp.code !== code && existOtp.attempts <= 5) {
      await this.otpRepo.updateOtp({
        email,
        type,
        attempts: existOtp.attempts + 1,
      });
      throw new BadRequestException('Mã OTP không đúng');
    }
    if (existOtp.attempts >= 5) {
      await this.otpRepo.deleteOtp({ email, type });
      throw new BadRequestException(
        'Bạn đã nhập sai OTP quá nhiều lần. Hãy lấy lại mã OTP mới nhé',
      );
    }
    if (existOtp.usedAt)
      throw new BadRequestException('Mã OTP đã được sử dụng');

    if (new Date(existOtp.expiresAt).getTime() < Date.now())
      throw new BadRequestException('Mã OTP đã hết hạn');

    return true;
  }

  async deleteOtp(payload: { email: string; type: OtpType }) {
    const { email, type } = payload;
    const otp = await this.otpRepo.findOtpByEmailAndType({ email, type });
    if (!otp) throw new BadRequestException('Mã OTP không tồn tại');
    await this.otpRepo.deleteOtp({ email, type });
  }
}

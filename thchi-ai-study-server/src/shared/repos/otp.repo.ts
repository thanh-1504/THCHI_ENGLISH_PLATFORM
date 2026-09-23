import { Injectable } from '@nestjs/common';
import { OtpType } from 'generated/prisma/enums';
import { CreateOTPType } from '../schemas/otp.schema';
import { PrismaService } from '../services/prisma.service';

@Injectable()
export class OtpRepo {
  constructor(private readonly prismaService: PrismaService) {}
  createOTP(payload: CreateOTPType) {
    const { email, code, type, expiresAt } = payload;
    return this.prismaService.otpCode.create({
      data: {
        email,
        code,
        type,
        expiresAt,
      },
    });
  }

  findOtpByEmailAndType(payload: { email: string; type: OtpType }) {
    const { email, type } = payload;
    return this.prismaService.otpCode.findUnique({
      where: {
        email_type: {
          email,
          type,
        },
      },
    });
  }

  updateOtp(payload: {
    email: string;
    type: OtpType;
    attempts: number;
    usedAt?: Date;
  }) {
    const { email, type, attempts, usedAt } = payload;
    return this.prismaService.otpCode.update({
      where: {
        email_type: {
          email,
          type,
        },
      },
      data: {
        attempts,
        usedAt,
      },
    });
  }

  deleteOtp(payload: { email: string; type: OtpType }) {
    const { email, type } = payload;
    return this.prismaService.otpCode.delete({
      where: {
        email_type: {
          email,
          type,
        },
      },
    });
  }
}

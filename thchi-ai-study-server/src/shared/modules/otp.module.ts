import { Module } from '@nestjs/common';
import { OtpRepo } from '../repos/otp.repo';
import { OtpService } from '../services/otp.service';

@Module({
  imports: [],
  providers: [OtpService, OtpRepo],
  exports: [OtpService],
})
export class OtpModule {}

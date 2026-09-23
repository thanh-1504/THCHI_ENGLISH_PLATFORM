import { createZodDto } from 'nestjs-zod';
import {
  CreateOTPSchema,
  SendOtpSchema,
  VerifyOtpSchema,
} from '../schemas/otp.schema';

export class SendOTPDTO extends createZodDto(SendOtpSchema) {}
export class CreateOTPDTO extends createZodDto(CreateOTPSchema) {}
export class VerifyOtpDTO extends createZodDto(VerifyOtpSchema) {}

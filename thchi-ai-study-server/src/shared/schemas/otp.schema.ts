import { OtpType } from 'generated/prisma/enums';
import z from 'zod';

const OTPSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  type: z.enum([OtpType.REGISTER, OtpType.FORGOT_PASSWORD]),
  code: z.string().length(6),
  expiresAt: z.coerce.date(),
  attempts: z.number().int().nonnegative().default(0),
  createdAt: z.coerce.date().default(() => new Date()),
});

export const SendOtpSchema = OTPSchema.pick({
  email: true,
  type: true,
});

export const CreateOTPSchema = OTPSchema.omit({
  id: true,
  attempts: true,
  createdAt: true,
});

export const VerifyOtpSchema = OTPSchema.pick({
  email: true,
  type: true,
  code: true,
});

export type OTPType = z.infer<typeof OTPSchema>;
export type CreateOTPType = z.infer<typeof CreateOTPSchema>;
export type VerifyOtpType = z.infer<typeof VerifyOtpSchema>;
export type SendOtpType = z.infer<typeof SendOtpSchema>;

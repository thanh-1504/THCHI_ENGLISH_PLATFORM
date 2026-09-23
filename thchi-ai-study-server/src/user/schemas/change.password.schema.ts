import { z } from 'zod';

const ChangePasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự')
      .max(60, 'Mật khẩu không được quá 60 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export type ChangePasswordType = z.infer<typeof ChangePasswordSchema>;
export default ChangePasswordSchema;

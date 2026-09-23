import z from 'zod';
export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token không được để trống'),
});
export type RefreshTokenType = z.infer<typeof RefreshTokenSchema>;

import { AuthProvider } from 'generated/prisma/enums';
import z from 'zod';

export const oauthSchema = z.object({
  userId: z.string(),
  provider: z.enum([AuthProvider.GOOGLE]),
  providerUid: z.string(),
});
export type OauthType = z.infer<typeof oauthSchema>;

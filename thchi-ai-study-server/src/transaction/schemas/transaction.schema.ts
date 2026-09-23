import { PaymentGateway } from 'generated/prisma/enums';
import z from 'zod';

export const CreateTransactionSchema = z.object({
  planId: z.string(),
  amount: z.number(),
  paymentCode: z.string().optional(),
  paymentGateway: z.nativeEnum(PaymentGateway),
});
export type CreateTransactionType = z.infer<typeof CreateTransactionSchema>;

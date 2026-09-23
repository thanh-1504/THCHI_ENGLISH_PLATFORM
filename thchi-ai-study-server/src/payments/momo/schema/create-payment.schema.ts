import { z } from 'zod';

export const CreatePaymentMomoSchema = z.object({
  orderId: z.string(),
  amount: z.number(),
  orderInfo: z.string(),
});
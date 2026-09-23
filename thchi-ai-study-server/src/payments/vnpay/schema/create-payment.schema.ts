import { z } from 'zod';

export const CreatePaymentVnPaySchema = z.object({
  orderId: z.string(),
  amount: z.number(),
  orderInfo: z.string(),
});

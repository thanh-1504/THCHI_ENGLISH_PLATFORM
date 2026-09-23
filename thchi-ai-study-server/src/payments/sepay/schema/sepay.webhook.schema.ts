import z from 'zod';

export const SepayWebhookSchema = z.object({
  id: z.number(),
  transactionDate: z.string(), 
  content: z.string(), 
  transferAmount: z.number(), 
  referenceCode: z.string(),
});

export type SepayWebhookType = z.infer<typeof SepayWebhookSchema>;

import { PremiumDuration, TransactionStatus } from 'generated/prisma/enums';
import z from 'zod';

const SubscriptionSchema = z.object({
  userId: z.string(),
  planId: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  isActive: z.boolean().default(true),
  grantedBy: z.string().optional(),
});

const TransactionSchema = z.object({
  userId: z.string(),
  planId: z.string(),
  amount: z.number().positive("giá amount không hợp lệ"),
  status: z.nativeEnum(TransactionStatus).default(TransactionStatus.PENDING),
  paymentGateway: z.string().optional(),
  gatewayRef: z.string().optional(),
  note: z.string().optional(),
});

const PremiumPlanSchema = z.object({
  name: z.string(),
  duration: z.nativeEnum(PremiumDuration),
  price: z.number().positive("Giá bán không hợp lệ"),
  originalPrice: z.number().positive("Giá gốc không hợp lệ").optional(),
  badge: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  subscriptions: z.array(SubscriptionSchema),
  transactions: z.array(TransactionSchema),
});

export const CreatePremiumPlanSchema = PremiumPlanSchema.pick({
  duration: true,
  price: true,
  originalPrice: true,
  badge: true,
  description: true,
  isActive: true,
});

export const UpdatePremiumPlanSchema = PremiumPlanSchema.pick({
  price: true,
  originalPrice: true,
  badge: true,
  description: true,
  isActive: true,
});

export type CreatePremiumPlanType = z.infer<typeof CreatePremiumPlanSchema>;
export type UpdatePremiumPlanType = z.infer<typeof UpdatePremiumPlanSchema>;

export type SearchPremiumPlanType = z.infer<typeof PremiumPlanSchema> & {
  page: number;
  limit: number;
};
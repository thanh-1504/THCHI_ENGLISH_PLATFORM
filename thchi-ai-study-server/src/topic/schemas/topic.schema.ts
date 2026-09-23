import z from 'zod';

export const TopicSchema = z.object({
  courseId: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  imageUrl: z.string().url().optional(),
  orderIndex: z.number(),
  isPremium: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
  deletedAt: z.date().optional(),
});

export type TopicType = z.infer<typeof TopicSchema>;

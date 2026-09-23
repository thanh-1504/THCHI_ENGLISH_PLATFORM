import { ReviewStep } from 'generated/prisma/enums';
import z from 'zod';

const ReviewSessionSchema = z.object({
  completedAt: z.date().optional(),
  totalWords: z.number().optional().default(0),
  correctCount: z.number().optional().default(0),
  xpEarned: z.number().optional().default(0),
  speedWpm: z.number().optional(),
});

const ReviewSessionLogSchema = z.object({
  reviewSessionId: z.string(),
  notebookEntryId: z.string(),
  step: z.nativeEnum(ReviewStep),
  isCorrect: z.boolean(),
});

export const CreateReviewSessionLogSchema = ReviewSessionLogSchema.pick({
  notebookEntryId: true,
  step: true,
  isCorrect: true,
});

export const CompleReviewSessionSchema = ReviewSessionSchema.omit({
  completedAt: true,
  speedWpm: true,
});

export type ReviewSessionType = z.infer<typeof ReviewSessionSchema>;
export type CreateReviewSessionLogType = z.infer<
  typeof CreateReviewSessionLogSchema
>;
export type CompleteReviewSessionType = z.infer<
  typeof CompleReviewSessionSchema
>;

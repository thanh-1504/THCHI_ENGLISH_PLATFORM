import { LearnStep } from 'generated/prisma/enums';
import z from 'zod';

export const LearningLogSchema = z.object({
  learningSessionId: z.string(),
  wordId: z.string(),
  step: z.nativeEnum(LearnStep),
  isCorrect: z.boolean(),
  attemptCount: z.number().default(1),
  completedAt: z.date().default(new Date()),
});

export const AiQuizLogSchema = z.object({
  userId: z.string().uuidv4(),
  learningSessionId: z.string().uuidv4(),
  wordId: z.string().uuidv4(),
  questionType: z.string(),
  isCorrect: z.boolean(),
  xpEarned: z.number().default(0),
  answeredAt: z.date().default(new Date()),
});

export const LearningSessionSchema = z.object({
  xpEarned: z.number().optional().default(0),
  wordsCount: z.number().optional().default(0),
});

export const CompleteLearningSessionSchema = z.object({
  xpEarned: z.number().optional().default(0),
  wordsCount: z.number().optional().default(0),
});

// export const CreateLearningSessionSchema = LearningSessionSchema;
export const CreateLearningLogSchema = LearningLogSchema;
export const CreateAiQuizLogSchema = AiQuizLogSchema;

// export type LearningSessionType = z.infer<typeof LearningSessionSchema>;
export type LearningLogType = z.infer<typeof LearningLogSchema>;
export type AiQuizLogType = z.infer<typeof AiQuizLogSchema>;
// export type CreateLearningSessionType = z.infer<
//   typeof CreateLearningSessionSchema
// >;
// export type CreateLearningSessionSchemaType = z.infer<
//   typeof CreateLearningSessionSchema
// >;
export type CreateLearningLogType = z.infer<typeof CreateLearningLogSchema>;
export type CreateAiQuizLogType = z.infer<typeof CreateAiQuizLogSchema>;
export type CompleteLearningSessionType = z.infer<
  typeof CompleteLearningSessionSchema
>;

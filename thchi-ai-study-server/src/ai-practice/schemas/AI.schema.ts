import z from 'zod';

export const GenerateSentenceSchema = z.object({
  topic: z.string().optional(),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).default('A1'),
});

export const GradeWritingSchema = z.object({
  vietnameseSentence: z.string(),
  userTranslation: z.string(),
  level: z.string(),
});

export const GradeSpeakingSchema = z.object({
  referenceSentence: z.string(),
  transcript: z.string(),
  level: z.string(),
});

export type GenerateSentenceType = z.infer<typeof GenerateSentenceSchema>;
export type GradeWritingType = z.infer<typeof GradeWritingSchema>;
export type GradeSpeakingType = z.infer<typeof GradeSpeakingSchema>;

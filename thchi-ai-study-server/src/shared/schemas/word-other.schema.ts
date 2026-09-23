import { WordType } from 'generated/prisma/enums';
import z from 'zod';

export const WordDefinitionSchema = z.object({
  // wordId: z.string(),
  wordType: z.nativeEnum(WordType),
  meaning: z.string(),
});

export const WordExampleSchema = z.object({
  // wordId: z.string(),
  sentence: z.string(),
  translation: z.string().optional().nullable(),
  isAiGenerated: z.boolean().default(false),
  // createdAt: z.date().default(new Date()),
});

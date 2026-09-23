import { WordType } from 'generated/prisma/enums';
import z from 'zod';

export const FileCsvSchema = z.object({
  term: z.string().min(1, 'term không được để trống'),
  wordType: z.nativeEnum(WordType),
  meaning: z.string().min(1, 'meaning không được để trống'),
  phonetic: z.string().optional(),
  audioUrl: z.string().optional(),
  sentence: z.string().optional(),
  translation: z.string().optional(),
  imageUrl: z.string().optional(),
});
export type FileCsvType = z.infer<typeof FileCsvSchema>;

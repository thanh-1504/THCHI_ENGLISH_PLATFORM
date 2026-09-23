import { WordLevel, WordStatus } from 'generated/prisma/enums';
import WordSchema from 'src/word/schemas/word.schema';
import z from 'zod';

const NoteBookSchema = z.object({
  userId: z.string(),
  totalWordsSaved: z.number().optional().default(0),
  notebookLevel: z.number().optional().default(1),
  createdAt: z.date().default(() => new Date()),
});

const NoteBookEntrySchema = z.object({
  notebookId: z.string(),
  level: z.nativeEnum(WordLevel),
  status: z.nativeEnum(WordStatus),
  savedAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  nextReviewAt: z.date().optional(),
  intervalDays: z.number().optional().default(1),
  easeFactor: z.number().optional().default(2.5),
  reviewCount: z.number().optional().default(0),
  masteredAt: z.date().optional(),
  words: WordSchema,
});

const CreateNoteBookSchema = NoteBookSchema.omit({
  userId: true,
  createdAt: true,
});

export type NoteBookType = z.infer<typeof NoteBookSchema>;
export type NoteBookEntryType = z.infer<typeof NoteBookEntrySchema>;
export type CreateNoteBookType = z.infer<typeof CreateNoteBookSchema>;

export { CreateNoteBookSchema, NoteBookEntrySchema, NoteBookSchema };

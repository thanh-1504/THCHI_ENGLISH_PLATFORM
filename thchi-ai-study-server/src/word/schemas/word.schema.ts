import {
  WordDefinitionSchema,
  WordExampleSchema,
} from 'src/shared/schemas/word-other.schema';
import z from 'zod';

const WordSchema = z.object({
  id: z.string().optional(),
  term: z.string().min(1, 'Từ vựng không được để trống').max(100),
  phonetic: z.string().max(100).nullable(),
  audioUrl: z.string().url('URL audio không hợp lệ').nullable().optional(),
  definitions: z.array(WordDefinitionSchema).min(1, 'Phải có ít nhất 1 nghĩa'),
  examples: z.array(WordExampleSchema).optional().default([]),
});
export default WordSchema;
export type Word = z.infer<typeof WordSchema>;

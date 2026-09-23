import { createZodDto } from 'nestjs-zod';
import { PaginationSchema } from 'src/shared/schemas/pagination.schema';
import { z } from 'zod';

const PaginationTopicQuerySchema = PaginationSchema.extend({
  courseId: z.string().uuid().optional(),
});
export type PaginationTopicQueryType = z.infer<
  typeof PaginationTopicQuerySchema
>;
export class PaginationTopicQueryDTO extends createZodDto(
  PaginationTopicQuerySchema,
) {}

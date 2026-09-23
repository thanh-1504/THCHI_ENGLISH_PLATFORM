import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { TopicSchema } from '../schemas/topic.schema';

export const CreateTopicSchema = TopicSchema.omit({
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});
export type CreateTopicType = z.infer<typeof CreateTopicSchema>;
export class CreateTopicDTO extends createZodDto(CreateTopicSchema) {}

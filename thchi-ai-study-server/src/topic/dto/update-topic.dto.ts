import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { TopicSchema } from '../schemas/topic.schema';

const UpdateTopicSchema = TopicSchema.partial().omit({
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});
export type UpdateTopicType = z.infer<typeof UpdateTopicSchema>;
export class UpdateTopicDTO extends createZodDto(UpdateTopicSchema) {}

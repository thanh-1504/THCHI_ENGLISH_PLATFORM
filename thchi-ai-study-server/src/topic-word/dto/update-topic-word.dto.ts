import { createZodDto } from 'nestjs-zod';
import TopicWordSchema from '../schemas/topic-word.schema';
import z from 'zod';

const UpdateTopicWordSchema = TopicWordSchema.partial();
export type UpdateTopicWordType = z.infer<typeof UpdateTopicWordSchema>;
export class UpdateTopicWordDto extends createZodDto(UpdateTopicWordSchema) {}

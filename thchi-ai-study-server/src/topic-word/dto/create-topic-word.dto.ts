import { createZodDto } from 'nestjs-zod';
import TopicWordSchema from '../schemas/topic-word.schema';
import z from 'zod';

const CreateTopicWordSchema = TopicWordSchema;
export type CreateTopicWordType = z.infer<typeof CreateTopicWordSchema>;
export class CreateTopicWordDTO extends createZodDto(CreateTopicWordSchema) {}

import { createZodDto } from 'nestjs-zod';
import { CompleteLearningSessionSchema } from '../schemas/learning-session.schema';

export class CompleteLearningSessionDTO extends createZodDto(
  CompleteLearningSessionSchema,
) {}

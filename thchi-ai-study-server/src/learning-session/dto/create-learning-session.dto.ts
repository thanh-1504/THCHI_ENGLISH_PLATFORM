import { createZodDto } from 'nestjs-zod';
import { CreateLearningLogSchema } from '../schemas/learning-session.schema';

export class CreateLearningLogDTO extends createZodDto(
  CreateLearningLogSchema,
) {}

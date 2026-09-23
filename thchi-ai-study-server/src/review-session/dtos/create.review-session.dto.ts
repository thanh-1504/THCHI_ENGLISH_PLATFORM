import { createZodDto } from 'nestjs-zod';
import { CreateReviewSessionLogSchema } from '../schemas/review-session.schema';

export class CreateReviewSessionLogDTO extends createZodDto(
  CreateReviewSessionLogSchema,
) {}


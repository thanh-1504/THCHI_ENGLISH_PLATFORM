import { createZodDto } from 'nestjs-zod';
import { CompleReviewSessionSchema } from '../schemas/review-session.schema';

export class CompleReviewSessionDTO extends createZodDto(
  CompleReviewSessionSchema,
) {}

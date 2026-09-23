import { createZodDto } from 'nestjs-zod';
import { ReviewPostSchema } from '../schemas/post.schema';

export class ReviewPostDTO extends createZodDto(ReviewPostSchema) {}

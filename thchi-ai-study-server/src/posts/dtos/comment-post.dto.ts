import { createZodDto } from 'nestjs-zod';
import { CreateCommentOnPostSchema, UpdateCommentOnPostSchema } from '../schemas/post.schema';

export class CreateCommentOnPostDTO extends createZodDto(
  CreateCommentOnPostSchema,
) {}

export class UpdateCommentOnPostDTO extends createZodDto(UpdateCommentOnPostSchema) {}
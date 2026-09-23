import { createZodDto } from 'nestjs-zod';
import { CreatePostSchema } from '../schemas/post.schema';

export class CreatePostDTO extends createZodDto(CreatePostSchema) {}

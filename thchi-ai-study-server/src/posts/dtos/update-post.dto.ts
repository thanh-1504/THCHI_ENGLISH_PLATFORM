import { createZodDto } from 'nestjs-zod';
import { UpdatePostSchema } from '../schemas/post.schema';

export class UpdatePostDTO extends createZodDto(UpdatePostSchema) {}

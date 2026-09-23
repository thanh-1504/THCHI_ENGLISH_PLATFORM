import { createZodDto } from 'nestjs-zod';
import { CreateUserProfileSchema } from '../schemas/user-profile.schema';

export class CreateUserProfileDTO extends createZodDto(
  CreateUserProfileSchema,
) {}

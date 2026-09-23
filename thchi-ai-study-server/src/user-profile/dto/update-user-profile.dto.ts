import { createZodDto } from 'nestjs-zod';
import { UpdateUserProfileSchema } from '../schemas/user-profile.schema';

export class UpdateUserProfileDTO extends createZodDto(
  UpdateUserProfileSchema,
) {}

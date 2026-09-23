import { createZodDto } from 'nestjs-zod';
import { ChangePasswordUserSchema } from '../schemas/user-profile.schema';

export class ChangePasswordUserDTO extends createZodDto(
  ChangePasswordUserSchema,
) {}

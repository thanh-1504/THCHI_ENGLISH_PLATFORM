import { createZodDto } from 'nestjs-zod';
import { UpdateStatusAccountSchema } from '../schemas/admin.schema';

export class UpdateStatusAccountDTO extends createZodDto(
  UpdateStatusAccountSchema,
) {}

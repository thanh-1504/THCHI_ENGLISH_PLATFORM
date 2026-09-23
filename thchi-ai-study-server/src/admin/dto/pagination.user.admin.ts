import { createZodDto } from 'nestjs-zod';
import { PaginationUserAdminSchema } from '../schemas/pagination.schema';

export class PaginationUserAdminDTO extends createZodDto(
  PaginationUserAdminSchema,
) {}

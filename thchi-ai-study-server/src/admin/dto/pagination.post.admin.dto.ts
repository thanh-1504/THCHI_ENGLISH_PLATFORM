import { createZodDto } from 'nestjs-zod';
import { PaginationPostAdminSchema } from '../schemas/pagination.schema';

export class PaginationPostAdminDTO extends createZodDto(
  PaginationPostAdminSchema,
) {}

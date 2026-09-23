import { createZodDto } from 'nestjs-zod';
import { PaginationTransactionSchema } from '../schemas/pagination.schema';

export class PaginationTransactionAdminDTO extends createZodDto(
  PaginationTransactionSchema,
) {}

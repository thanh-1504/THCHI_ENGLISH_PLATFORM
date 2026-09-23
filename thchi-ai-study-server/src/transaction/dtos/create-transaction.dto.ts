import { createZodDto } from 'nestjs-zod';
import { CreateTransactionSchema } from '../schemas/transaction.schema';

export class CreateTransactionDto extends createZodDto(
  CreateTransactionSchema,
) {}

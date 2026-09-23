import { createZodDto } from 'nestjs-zod';
import { CreatePaymentMomoSchema } from '../schema/create-payment.schema';

export class CreatePaymentMomoDTO extends createZodDto(
  CreatePaymentMomoSchema,
) {}

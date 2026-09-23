import { createZodDto } from 'nestjs-zod';
import { CreatePaymentVnPaySchema } from '../schema/create-payment.schema';

export class CreatePaymentVnPayDTO extends createZodDto(
  CreatePaymentVnPaySchema,
) {}

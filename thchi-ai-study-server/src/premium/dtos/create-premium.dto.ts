import { createZodDto } from 'nestjs-zod';
import { CreatePremiumPlanSchema } from '../schemas/premium.schema';

export class CreatePremiumPlanDTO extends createZodDto(
  CreatePremiumPlanSchema,
) {}

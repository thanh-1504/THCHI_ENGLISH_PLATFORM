import { createZodDto } from 'nestjs-zod';
import { UpdatePremiumPlanSchema } from '../schemas/premium.schema';

export class UpdatePremiumPlanDTO extends createZodDto(
  UpdatePremiumPlanSchema,
) {}

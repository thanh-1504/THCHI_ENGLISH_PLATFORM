import { createZodDto } from 'nestjs-zod';
import CreateStreakGoalSchema from '../schemas/create.streak-goal.schema';

export class CreateStreakGoalDTO extends createZodDto(CreateStreakGoalSchema) {}

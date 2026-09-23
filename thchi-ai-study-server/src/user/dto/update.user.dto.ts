import { createZodDto } from 'nestjs-zod';
import UpdateUserSchema from '../schemas/update.user.schema';

export class UpdateUserDTO extends createZodDto(UpdateUserSchema) {}

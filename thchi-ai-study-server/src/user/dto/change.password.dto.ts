import { createZodDto } from 'nestjs-zod';
import ChangePasswordSchema from '../schemas/change.password.schema';

export class ChangePasswordDTO extends createZodDto(ChangePasswordSchema) {}

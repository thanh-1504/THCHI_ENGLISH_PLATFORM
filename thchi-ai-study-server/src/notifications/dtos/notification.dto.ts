import { createZodDto } from 'nestjs-zod';
import {
  CreateNotificaionSchema,
  MarkAsReadSchema,
} from '../schemas/notification.schema';

export class MarkAsReadDTO extends createZodDto(MarkAsReadSchema) {}
export class CreateNotificationDTO extends createZodDto(
  CreateNotificaionSchema,
) {}

import { createZodDto } from 'nestjs-zod';
import { SepayWebhookSchema } from '../schema/sepay.webhook.schema';

export class SepayWebhookDTO extends createZodDto(SepayWebhookSchema) {}

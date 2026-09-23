import { createZodDto } from 'nestjs-zod';
import { oauthSchema } from '../schemas/oauth.user.schema';

export class CreateOauthDTO extends createZodDto(oauthSchema) {}

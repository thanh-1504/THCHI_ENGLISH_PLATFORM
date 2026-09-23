import { createZodDto } from 'nestjs-zod';
import {
  CreateRankTierConfigSchema,
  CreateTopicAdminSchema,
  CreateUserAdminSchema,
  UpdateRankTierConfigSchema,
} from '../schemas/admin.schema';

export class CreateUserAdminDTO extends createZodDto(CreateUserAdminSchema) {}
export class CreateTopicAdminDTO extends createZodDto(CreateTopicAdminSchema) {}
export class CreateRankTierConfigDTO extends createZodDto(CreateRankTierConfigSchema) {}
export class UpdateRankTierConfigDTO extends createZodDto(UpdateRankTierConfigSchema) {}

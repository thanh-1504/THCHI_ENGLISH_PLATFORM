import { AccountStatus, RankTier, Role } from 'generated/prisma/enums';
import {
  WordDefinitionSchema,
  WordExampleSchema,
} from 'src/shared/schemas/word-other.schema';
import z from 'zod';

export const UpdateStatusAccountSchema = z.object({
  status: z.nativeEnum(AccountStatus),
});

export const CreateUserAdminSchema = z.object({
  name: z.string().min(1, 'Họ và tên không được để trống'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  role: z.nativeEnum(Role),
});

export const CreateTopicAdminSchema = z.object({
  topic: z.object({
    title: z.string().min(1, 'Tiêu đề không được để trống'),
    subtitle: z.string().min(1, 'Tiêu đề phụ không được để trống'),
    imageUrl: z.string().min(1, 'Ảnh không được để trống'),
    orderIndex: z.number(),
    isPremium: z.boolean().default(false),
    isPublished: z.boolean().default(false),
  }),
  wordList: z.array(
    z.object({
      term: z.string().min(1, 'Từ vựng không được để trống').max(100),
      phonetic: z.string().max(100).nullable(),
      audioUrl: z.string().url('URL audio không hợp lệ').nullable(),
      imageUrl: z.string().url('URL ảnh không hợp lệ').nullable(),
      definitions: z
        .array(WordDefinitionSchema)
        .min(1, 'Phải có ít nhất 1 nghĩa'),
      examples: z.array(WordExampleSchema).optional().default([]),
    }),
  ),
});

export const CreateRankTierConfigSchema = z.object({
  tier: z.nativeEnum(RankTier),
  xpRequired: z.number().int().min(0),
  xpToMaintain: z.number().int().min(0),
  description: z.string().optional(),
});

export const UpdateRankTierConfigSchema = z.object({
  xpRequired: z.number().int().min(0).optional(),
  xpToMaintain: z.number().int().min(0).optional(),
  description: z.string().optional(),
});

export type UpdateStatusAccountType = z.infer<typeof UpdateStatusAccountSchema>;
export type CreateUserAdminType = z.infer<typeof CreateUserAdminSchema>;
export type CreateTopicAdminType = z.infer<typeof CreateTopicAdminSchema>;
export type CreateRankTierConfigType = z.infer<typeof CreateRankTierConfigSchema>;
export type UpdateRankTierConfigType = z.infer<typeof UpdateRankTierConfigSchema>;

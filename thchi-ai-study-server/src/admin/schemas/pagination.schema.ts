import {
  AccountStatus,
  PostStatus,
  Role,
  TransactionStatus,
} from 'generated/prisma/enums';
import { PaginationSchema } from 'src/shared/schemas/pagination.schema';
import z from 'zod';

export const PaginationUserAdminSchema = PaginationSchema.extend({
  name_email: z.string().optional().default(''),
  role: z.nativeEnum(Role).optional(),
  status: z.nativeEnum(AccountStatus).optional(),
});

export const PaginationTransactionSchema = PaginationSchema.extend({
  search: z.string().optional().default(''),
  planName: z.string().optional().default(''),
  status: z.nativeEnum(TransactionStatus).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

export const PaginationPostAdminSchema = PaginationSchema.extend({
  title: z.string().optional().default(''),
  status: z.nativeEnum(PostStatus).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

export type PaginationUserAdminType = z.infer<typeof PaginationUserAdminSchema>;
export type PaginationTransactionType = z.infer<typeof PaginationTransactionSchema>;
export type PaginationPostAdminType = z.infer<typeof PaginationPostAdminSchema>;

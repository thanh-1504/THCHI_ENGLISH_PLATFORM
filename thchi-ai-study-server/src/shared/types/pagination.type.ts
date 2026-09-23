import z from 'zod';
import { PaginationQuerySchema } from '../dtos/pagination.dto';

export type PaginationQueryType = z.infer<typeof PaginationQuerySchema>;

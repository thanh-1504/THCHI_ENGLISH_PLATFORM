import { z } from 'zod';
const CourseSchema = z.object({
  title: z.string().min(1, 'Bạn ơi thiếu tên khóa học nè'),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  imagePublicId: z.string().optional(),
  isPremium: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  orderIndex: z.number().positive().min(1),
  createdAt: z.date().default(new Date()),
  deletedAt: z.date().optional(),
});
export default CourseSchema;
export type CourseType = z.infer<typeof CourseSchema>;

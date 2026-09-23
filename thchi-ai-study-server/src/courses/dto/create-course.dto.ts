import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import CourseSchema from '../schemas/course.schema';

export const CreateCourseSchema = CourseSchema.pick({
  title: true,
  subtitle: true,
  description: true,
  imageUrl: true,
  isPremium: true,
  isPublished: true,
  orderIndex: true,
});
export type CreateCourseType = z.infer<typeof CreateCourseSchema>;
export class CreateCourseDTO extends createZodDto(CreateCourseSchema) {}

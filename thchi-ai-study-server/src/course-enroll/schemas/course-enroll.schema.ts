import z from 'zod';

const CourseEnrollSchema = z.object({
  userId: z.string(),
  courseId: z.string(),
  enrolledAt: z.date().default(new Date()),
  completedAt: z.date().optional(),
  lastAccessedAt: z.date().optional(),
});

export const CreateCourseEnrollSchema = CourseEnrollSchema.pick({
  courseId: true,
});
export type CourseEnrollType = z.infer<typeof CourseEnrollSchema>;
export type CreateCourseEnrollType = z.infer<typeof CreateCourseEnrollSchema>;
export default CourseEnrollSchema;

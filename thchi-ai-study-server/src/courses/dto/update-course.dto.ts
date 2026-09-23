import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { CreateCourseSchema } from './create-course.dto';

const UpdateCourseSchema = CreateCourseSchema.partial();

export type UpdateCourseType = z.infer<typeof UpdateCourseSchema>;
export class UpdateCourseDTO extends createZodDto(UpdateCourseSchema) {}

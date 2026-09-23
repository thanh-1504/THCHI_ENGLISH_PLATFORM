import { createZodDto } from 'nestjs-zod';
import { CreateCourseEnrollSchema } from '../schemas/course-enroll.schema';

export class CreateCourseEnrollDTO extends createZodDto(
  CreateCourseEnrollSchema,
) {}

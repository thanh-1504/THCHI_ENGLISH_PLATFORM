import { Module } from '@nestjs/common';
import { CourseRepo } from '../repos/course.repo';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';

@Module({
  controllers: [CoursesController],
  providers: [CoursesService, CourseRepo],
})
export class CoursesModule {}

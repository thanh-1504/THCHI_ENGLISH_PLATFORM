import { Module } from '@nestjs/common';
import { TopicRepo } from 'src/topic/repos/topic.repo';
import { CourseRepo } from '../repos/course.repo';
import { CoursesAdminService } from './courses.amin.service';
import { CoursesAdminController } from './courses.admin.controller';

@Module({
  controllers: [CoursesAdminController],
  providers: [CoursesAdminService, CourseRepo, TopicRepo],
})
export class CoursesAdminModule {}

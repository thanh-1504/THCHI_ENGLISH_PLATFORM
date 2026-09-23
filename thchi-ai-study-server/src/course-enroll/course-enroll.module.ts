import { Module } from '@nestjs/common';
import { CourseEnrollController } from './course-enroll.controller';
import { CourseEnrollService } from './course-enroll.service';
import { CourseEnrollRepo } from './repos/course-enroll.repo';

@Module({
  controllers: [CourseEnrollController],
  providers: [CourseEnrollService, CourseEnrollRepo],
})
export class CourseEnrollModule {}

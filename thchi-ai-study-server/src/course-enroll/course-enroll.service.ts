import { Injectable } from '@nestjs/common';
import { CourseEnrollRepo } from './repos/course-enroll.repo';
import { CreateCourseEnrollType } from './schemas/course-enroll.schema';

@Injectable()
export class CourseEnrollService {
  constructor(private readonly courseEnrollRepo: CourseEnrollRepo) {}
  async create(createCourseEnrollDto: CreateCourseEnrollType, userId: string) {
    return await this.courseEnrollRepo.create(createCourseEnrollDto, userId);
  }

  async findAll(userId: string) {
    return await this.courseEnrollRepo.findAll(userId);
  }

  async getCourseProgress(courseId: string, userId: string) {
    return await this.courseEnrollRepo.getCourseProgress(courseId, userId);
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { CreateCourseEnrollType } from '../schemas/course-enroll.schema';

@Injectable()
export class CourseEnrollRepo {
  constructor(private readonly prismaService: PrismaService) {}

  findOne(userId: string, courseId: string) {
    return this.prismaService.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });
  }

  findAll(userId: string) {
    return this.prismaService.courseEnrollment.findMany({
      where: {
        userId,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  create(payload: CreateCourseEnrollType, userId: string) {
    return this.prismaService.courseEnrollment.upsert({
      where: {
        userId_courseId: {
          userId,
          courseId: payload.courseId,
        },
      },
      create: {
        userId,
        courseId: payload.courseId,
      },
      update: { lastAccessedAt: new Date() },
    });
  }

  async getCourseProgress(courseId: string, userId: string) {
    const sessions = await this.prismaService.learningSession.findMany({
      where: {
        userId,
        topic: { courseId },
        completedAt: { not: null },
      },
      select: { topicId: true },
      distinct: ['topicId'],
    });
    return sessions.map((s) => s.topicId);
  }
}

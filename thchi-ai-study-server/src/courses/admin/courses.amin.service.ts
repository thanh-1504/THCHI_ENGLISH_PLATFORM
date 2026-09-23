import { BadRequestException, Injectable } from '@nestjs/common';
import { TopicRepo } from 'src/topic/repos/topic.repo';
import { PaginationQueryType } from 'src/shared/types/pagination.type';
import { CreateCourseType } from '../dto/create-course.dto';
import { UpdateCourseType } from '../dto/update-course.dto';
import { CourseRepo } from '../repos/course.repo';

@Injectable()
export class CoursesAdminService {
  constructor(
    private readonly courseRepo: CourseRepo,
    private readonly topicRepo: TopicRepo,
  ) {}

  async create(createCourseDto: CreateCourseType) {
    const course = await this.courseRepo.findByTitle(createCourseDto.title);
    if (course) throw new BadRequestException('Khóa học đã tồn tại');
    return await this.courseRepo.createCourse(createCourseDto);
  }

  async findAll(paginationQueryDTO: PaginationQueryType) {
    const { page, limit } = paginationQueryDTO;
    const [total, courses] = await this.courseRepo.findAll({ page, limit });
    const totalPage = Math.ceil(total / limit);

    const data = (courses as any[]).map((course) => {
      const topicCount = course._count?.topics ?? 0;
      const totalWords = (course.topics ?? []).reduce(
        (sum: number, topic: any) => sum + (topic._count?.topicWords ?? 0),
        0,
      );
      const { topics, _count, ...rest } = course;
      return { ...rest, topicCount, totalWords };
    });

    return {
      total,
      totalPage,
      page,
      limit,
      data,
    };
  }

  async findOne(id: string) {
    const course = await this.courseRepo.findOne(id);
    if (!course) throw new BadRequestException('Không tìm thấy khóa học');
    return course;
  }

  async findTopicsByCourse(
    courseId: string,
    paginationQuery: PaginationQueryType,
  ) {
    const course = await this.courseRepo.findOne(courseId);
    if (!course) throw new BadRequestException('Không tìm thấy khóa học');

    const [total, topics] = await this.topicRepo.findAll({
      ...paginationQuery,
      courseId,
    });
    const totalPage = Math.ceil(total / paginationQuery.limit);

    const data = (topics as any[]).map((topic) => {
      const wordCount = topic._count?.topicWords ?? 0;
      const { _count, ...rest } = topic;
      return { ...rest, wordCount };
    });

    return {
      total,
      totalPage,
      page: paginationQuery.page,
      limit: paginationQuery.limit,
      data,
    };
  }

  async update(id: string, updateCourseDto: UpdateCourseType) {
    const course = await this.courseRepo.findOne(id);
    if (!course) throw new BadRequestException('Không tìm thấy khóa học');
    return await this.courseRepo.updateCourse(id, updateCourseDto);
  }

  async remove(id: string) {
    const course = await this.courseRepo.findOne(id);
    if (!course) throw new BadRequestException('Không tìm thấy khóa học');
    return await this.courseRepo.deleteCourse(id);
  }
}

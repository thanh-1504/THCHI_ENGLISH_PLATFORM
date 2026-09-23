import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCourseType } from '../dto/create-course.dto';
import { UpdateCourseType } from '../dto/update-course.dto';
import { CourseRepo } from '../repos/course.repo';
import { PaginationQueryType } from 'src/shared/types/pagination.type';

@Injectable()
export class CoursesService {
  constructor(private readonly courseRepo: CourseRepo) {}
  async create(createCourseDto: CreateCourseType) {
    const course = await this.courseRepo.findByTitle(createCourseDto.title);
    if (course) throw new BadRequestException('Khóa học đã tồn tại');
    return await this.courseRepo.createCourse(createCourseDto);
  }

  async findAll(paginationQueryDTO: PaginationQueryType) {
    const { page, limit } = paginationQueryDTO;
    const [total, courses] = await this.courseRepo.findAll({ page, limit });
    const totalPage = Math.ceil(total / limit);
    return {
      total,
      totalPage,
      page,
      limit,
      data: courses,
    };
  }

  async findCourseForUser() {
    return await this.courseRepo.findCourseForUser();
  }

  async findOne(id: string) {
    const course = await this.courseRepo.findOneWithTopic(id);
    if (!course) throw new BadRequestException('Không tìm thấy khóa học');
    return course;
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

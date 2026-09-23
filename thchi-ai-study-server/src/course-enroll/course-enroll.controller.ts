import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { User } from 'src/shared/decorators/user.decorator';
import { CourseEnrollService } from './course-enroll.service';
import { CreateCourseEnrollDTO } from './dto/create-course-enroll.dto';

@Controller('course-enroll')
export class CourseEnrollController {
  constructor(private readonly courseEnrollService: CourseEnrollService) {}

  @Post()
  create(
    @Body() createCourseEnrollDto: CreateCourseEnrollDTO,
    @User('id') userId: string,
  ) {
    return this.courseEnrollService.create(createCourseEnrollDto, userId);
  }

  @Get()
  findAll(@User('id') userId: string) {
    return this.courseEnrollService.findAll(userId);
  }

  @Get('progress/:courseId')
  getCourseProgress(
    @Param('courseId') courseId: string,
    @User('id') userId: string,
  ) {
    return this.courseEnrollService.getCourseProgress(courseId, userId);
  }
}

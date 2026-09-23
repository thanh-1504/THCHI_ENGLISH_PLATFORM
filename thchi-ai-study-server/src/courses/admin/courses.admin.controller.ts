import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PaginationQueryDTO } from '../../shared/dtos/pagination.dto';
import { CreateCourseDTO } from '../dto/create-course.dto';
import { UpdateCourseDTO } from '../dto/update-course.dto';
import { CoursesAdminService } from './courses.amin.service';

@Controller('admin/courses')
export class CoursesAdminController {
  constructor(private readonly coursesService: CoursesAdminService) {}

  @Post()
  create(@Body() createCourseDto: CreateCourseDTO) {
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  findAll(@Query() paginationQueryDTO: PaginationQueryDTO) {
    return this.coursesService.findAll(paginationQueryDTO);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Get(':id/topics')
  findTopics(
    @Param('id') id: string,
    @Query() paginationQueryDTO: PaginationQueryDTO,
  ) {
    return this.coursesService.findTopicsByCourse(id, paginationQueryDTO);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDTO) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTopicType } from './dto/create-topic.dto';
import { PaginationTopicQueryType } from './dto/pagination.dto';
import { UpdateTopicType } from './dto/update-topic.dto';
import { TopicRepo } from './repos/topic.repo';

@Injectable()
export class TopicService {
  constructor(private readonly topicRepo: TopicRepo) {}
  async create(createTopicDto: CreateTopicType) {
    const course = await this.topicRepo.findAllByCourse(
      createTopicDto.courseId,
    );
    if (!course) throw new BadRequestException('Không tìm thấy khóa học này');
    const isExisting = await this.topicRepo.findByCourseAndOrderIndex({
      courseId: createTopicDto.courseId,
      orderIndex: createTopicDto.orderIndex,
    });
    if (isExisting)
      throw new BadRequestException('Đã tồn tại bài học này trong khóa học');
    return await this.topicRepo.create(createTopicDto);
  }

  async findAll(paginationQueryDTO: PaginationTopicQueryType) {
    const { page, limit } = paginationQueryDTO;
    const [total, topics] = await this.topicRepo.findAll({ page, limit });
    const totalPage = Math.ceil(total / limit);
    return {
      total,
      totalPage,
      page,
      limit,
      data: topics,
    };
  }

  async findOne(id: string) {
    const topic = await this.topicRepo.findOne(id);
    if (!topic) throw new NotFoundException('Không tìm thấy bài học này');
    return topic;
  }

  async update(id: string, updateTopicDto: UpdateTopicType) {
    const topic = await this.topicRepo.findOne(id);
    if (!topic) throw new NotFoundException('Không tìm thấy bài học này');
    if (
      updateTopicDto.orderIndex &&
      updateTopicDto.orderIndex !== topic.orderIndex
    ) {
      const existing = await this.topicRepo.findByCourseAndOrderIndex({
        courseId: topic.courseId,
        orderIndex: updateTopicDto.orderIndex,
      });
      if (existing) {
        throw new BadRequestException(
          'Thứ tự bài học này đã tồn tại trong khóa học',
        );
      }
      if (updateTopicDto.isPublished) {
        const wordCount = topic.topicWords.length ?? 0;
        if (wordCount < 5) {
          throw new BadRequestException(
            'Bài học phải có ít nhất 5 từ mới được xuất bản',
          );
        }
      }
    }

    return await this.topicRepo.update(id, updateTopicDto);
  }

  async remove(id: string) {
    const topic = await this.topicRepo.findOne(id);
    if (!topic) throw new NotFoundException('Không tìm thấy bài học này');
    return await this.topicRepo.remove(id);
  }
}

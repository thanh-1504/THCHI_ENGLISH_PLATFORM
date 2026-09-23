import { Injectable } from '@nestjs/common';
import { Topic } from 'generated/prisma/client';
import { PrismaService } from 'src/shared/services/prisma.service';
import { CreateTopicType } from '../dto/create-topic.dto';
import { PaginationTopicQueryType } from '../dto/pagination.dto';
import { UpdateTopicType } from '../dto/update-topic.dto';

@Injectable()
export class TopicRepo {
  constructor(private readonly prisma: PrismaService) {}

  findOne(id: string) {
    return this.prisma.topic.findUnique({
      where: {
        id: id,
        deletedAt: null,
      },
      include: {
        topicWords: {
          include: {
            word: true,
          },
        },
      },
    });
  }

  findAll(pagnitaionQuery: PaginationTopicQueryType) {
    const { page, limit, courseId } = pagnitaionQuery;
    const skip = (page - 1) * limit;
    const take = limit;
    const where = { deletedAt: null, ...(courseId ? { courseId } : {}) };
    return this.prisma.$transaction([
      this.prisma.topic.count({ where }),
      this.prisma.topic.findMany({
        where,
        skip,
        take,
        orderBy: {
          orderIndex: 'asc',
        },
        include: {
          _count: {
            select: { topicWords: true },
          },
        },
      }),
    ]);
  }

  findAllByCourse(courseId: string) {
    return this.prisma.topic.findMany({
      where: {
        courseId,
        deletedAt: null,
      },
    });
  }

  findByCourseAndOrderIndex({
    courseId,
    orderIndex,
  }: {
    courseId: string;
    orderIndex: number;
  }) {
    return this.prisma.topic.findFirst({
      where: {
        courseId,
        orderIndex,
        deletedAt: null,
      },
      include: {
        _count: {
          select: { topicWords: true },
        },
      },
    });
  }

  create(createTopicDto: CreateTopicType) {
    return this.prisma.topic.create({
      data: createTopicDto,
    });
  }

  update(id: string, updateTopicDto: UpdateTopicType) {
    return this.prisma.topic.update({
      where: {
        id,
        deletedAt: null,
      },
      data: updateTopicDto,
    });
  }

  remove(id: string) {
    return this.prisma.topic.update({
      where: { id, deletedAt: null },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}

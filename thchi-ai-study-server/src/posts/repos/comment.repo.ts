import { Injectable } from '@nestjs/common';
import { NotificationType } from 'generated/prisma/enums';
import { PrismaService } from 'src/shared/services/prisma.service';
import {
  CreateCommentOnPostType,
  UpdateCommentType,
} from '../schemas/post.schema';

@Injectable()
export class CommentRepo {
  constructor(private readonly prismaService: PrismaService) {}

  findOne(id: string) {
    return this.prismaService.comment.findUnique({
      where: { id },
    });
  }

  create(
    id: string,
    userId: string,
    idUserOfPost: string,
    userName: string,
    payload: CreateCommentOnPostType,
  ) {
    return this.prismaService.$transaction([
      this.prismaService.comment.create({
        data: {
          userId,
          content: payload.content,
          postId: id,
        },
      }),
      this.prismaService.notification.create({
        data: {
          userId: idUserOfPost,
          actorId: userId,
          type: NotificationType.POST_COMMENTED,
          postId: id,
          message: `${userName} đã bình luận vào bài viết của bạn`,
        },
      }),
    ]);
  }

  update(id: string, payload: UpdateCommentType) {
    return this.prismaService.comment.update({
      where: { id },
      data: {
        content: payload.content,
      },
    });
  }

  delete(id: string) {
    return this.prismaService.comment.delete({
      where: { id },
    });
  }
}

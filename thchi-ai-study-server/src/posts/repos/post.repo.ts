import { Injectable } from '@nestjs/common';
import { NotificationType, PostStatus } from 'generated/prisma/enums';
import { PrismaService } from 'src/shared/services/prisma.service';
import {
  CreatePostType,
  ReviewPostType,
  UpdatePostType,
} from '../schemas/post.schema';

@Injectable()
export class PostRepo {
  constructor(private readonly prismaService: PrismaService) {}

  findAll() {
    return this.prismaService.post.findMany({
      where: { status: PostStatus.APPROVED, deletedAt: null },
      select: {
        content: true,
        createdAt: true,
        id: true,
        imageUrl: true,
        status: true,
        title: true,
        _count: {
          select: { likes: true, comments: true },
        },
        user: {
          select: {
            id: true,
            profile: { select: { avatarUrl: true, displayName: true } },
          },
        },
      },
    });
  }

  findOne(id: string) {
    return this.prismaService.post.findUnique({
      where: { id, deletedAt: null },
      select: {
        id: true,
        userId: true,      // ← cần để biết chủ bài viết
        content: true,
        createdAt: true,
        imageUrl: true,
        title: true,
        status: true,
        _count: {
          select: { likes: true, comments: true },
        },
        user: {
          select: {
            id: true,
            profile: { select: { avatarUrl: true, displayName: true } },
          },
        },
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                profile: { select: { avatarUrl: true, displayName: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  findOnePostLike(id: string, userId: string) {
    return this.prismaService.postLike.findUnique({
      where: { postId_userId: { postId: id, userId } },
    });
  }

  findMyPost(userId: string) {
    return this.prismaService.post.findMany({
      where: { userId, deletedAt: null },
      select: {
        content: true,
        createdAt: true,
        id: true,
        imageUrl: true,
        status: true,
        title: true,
        _count: {
          select: { likes: true, comments: true },
        },
        user: {
          select: {
            id: true,
            profile: { select: { avatarUrl: true, displayName: true } },
          },
        },
      },
    });
  }

  create(userId: string, payload: CreatePostType) {
    return this.prismaService.post.create({
      data: {
        ...payload,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  likePost(id: string, postOwnerId: string, likerUserId: string, actor: any) {
    return this.prismaService.$transaction([
      this.prismaService.postLike.create({
        data: {
          userId: likerUserId,
          postId: id,
        },
      }),
      this.prismaService.notification.create({
        data: {
          userId: postOwnerId,   // ← chủ bài viết nhận thông báo
          actorId: actor.id,
          type: NotificationType.POST_LIKED,
          postId: id,
          message: `${actor.name} đã thích bài viết của bạn`,
        },
      }),
    ]);
  }

  unLikePost(id: string, userId: string) {
    return this.prismaService.postLike.delete({
      where: { postId_userId: { userId, postId: id } },
    });
  }

  update(id: string, userId: string, payload: UpdatePostType) {
    return this.prismaService.post.update({
      where: { id, userId },
      data: {
        ...payload,
      },
    });
  }

  remove(id: string) {
    return this.prismaService.post.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  review(id: string, userId: string, payload: ReviewPostType) {
    return this.prismaService.$transaction([
      this.prismaService.post.update({
        where: { id },
        data: {
          ...payload,
        },
      }),
      this.prismaService.notification.create({
        data: {
          userId,
          type: NotificationType.POST_APPROVED,
          postId: id,
          message: `Bài viết của bạn đã được phê duyệt`,
        },
      }),
    ]);
  }
}

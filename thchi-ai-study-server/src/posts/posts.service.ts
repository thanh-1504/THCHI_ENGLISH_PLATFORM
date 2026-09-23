import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from 'src/user/repos/user.repo';
import { NotificationGateway } from 'src/websocket/notification.gateway';
import { PostRepo } from './repos/post.repo';
import {
  CreatePostType,
  ReviewPostType,
  UpdatePostType,
} from './schemas/post.schema';

@Injectable()
export class PostsService {
  constructor(
    private readonly postRepo: PostRepo,
    private readonly userRepo: UserRepository,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async findAll() {
    const posts = await this.postRepo.findAll();
    return posts.map((post) => {
      const { _count, ...restPost } = post;
      return {
        ...restPost,
        user: {
          id: post.user.id,
          avatar: post.user.profile?.avatarUrl ?? '',
          displayName: post.user.profile?.displayName ?? '',
        },
        likes: _count?.likes ?? 0,
        comments: _count?.comments ?? 0,
      };
    });
  }

  async findMyPost(userId: string) {
    const myPosts = await this.postRepo.findMyPost(userId);
    return myPosts.map((post) => {
      const { _count, ...restPost } = post;
      return {
        ...restPost,
        user: {
          avatar: post.user.profile?.avatarUrl ?? '',
          displayName: post.user.profile?.displayName ?? '',
        },
        likes: _count?.likes ?? 0,
        comments: _count?.comments ?? 0,
      };
    });
  }

  async create(userId: string, createPostDto: CreatePostType) {
    return await this.postRepo.create(userId, createPostDto);
  }

  async findOne(id: string) {
    const post = await this.postRepo.findOne(id);
    if (!post) throw new NotFoundException('Không tìm thấy bài viết này');
    const { _count, ...restPost } = post;
    return {
      ...restPost,
      user: {
        avatar: post.user.profile?.avatarUrl ?? '',
        displayName: post.user.profile?.displayName ?? '',
      },
      likes: _count?.likes ?? 0,
      comments: _count?.comments ?? 0,
      commentsList: post.comments.map((comment) => ({
        ...comment,
        user: {
          avatar: comment.user.profile?.avatarUrl ?? '',
          displayName: comment.user.profile?.displayName ?? '',
        },
      })),
    };
  }

  async likePost(id: string, userId: string) {
    const post = await this.postRepo.findOne(id);
    if (!post) throw new NotFoundException('Không tìm thấy bài viết này');
    const like = await this.postRepo.findOnePostLike(id, userId);
    const liker = await this.userRepo.findUserByIdOrEmail({ id: userId });
    let isLiked = false;
    if (like) {
      await this.postRepo.unLikePost(id, userId);
      isLiked = false;
    } else {
      const postOwnerId = post.userId;
      const [_, notification] = await this.postRepo.likePost(id, postOwnerId, userId, liker);
      // Emit socket về cho CHỦ BÀI VIẾT, không phải người like
      this.notificationGateway.emitToUser(
        postOwnerId,
        'notification:new',
        notification,
      );
      isLiked = true;
    }
    const updatedPost = await this.postRepo.findOne(id);
    return {
      isLiked,
      likesCount: updatedPost?._count.likes ?? 0,
    };
  }

  async update(id: string, userId: string, updatePostDto: UpdatePostType) {
    const post = await this.postRepo.findOne(id);
    if (!post) throw new NotFoundException('Không tìm thấy bài viết này');
    if (post.user.id !== userId)
      throw new ForbiddenException('Bạn không thể sửa bài viết này');
    return await this.postRepo.update(id, userId, updatePostDto);
  }

  async remove(id: string, userId: string) {
    const post = await this.postRepo.findOne(id);
    if (!post) throw new NotFoundException('Không tìm thấy bài viết này');
    if (post.user.id !== userId)
      throw new ForbiddenException('Bạn không thể xóa bài viết này');
    return await this.postRepo.remove(id);
  }

  async reviewPost(id: string, reviewPostDTO: ReviewPostType) {
    const post = await this.postRepo.findOne(id);
    if (!post) throw new NotFoundException('Không tìm thấy bài viết này');
    return await this.postRepo.review(id, post.user.id, reviewPostDTO);
  }
}

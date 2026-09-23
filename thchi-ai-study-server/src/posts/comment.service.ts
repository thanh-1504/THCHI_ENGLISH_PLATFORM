import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from 'src/user/repos/user.repo';
import { NotificationGateway } from 'src/websocket/notification.gateway';
import { UpdateCommentOnPostDTO } from './dtos/comment-post.dto';
import { CommentRepo } from './repos/comment.repo';
import { PostRepo } from './repos/post.repo';
import { CreateCommentOnPostType } from './schemas/post.schema';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepo: CommentRepo,
    private readonly userRepo: UserRepository,
    private readonly postRepo: PostRepo,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async create(
    id: string,
    userId: string,
    createCommentOnPostDTO: CreateCommentOnPostType,
  ) {
    const post = await this.postRepo.findOne(id);
    //    const commenter = await this.userRepo.findUserByIdOrEmail({ id: userId });
    const [comment, notification] = await this.commentRepo.create(
      id,
      userId,
      post?.user?.id!,
      post?.user?.profile?.displayName!,
      createCommentOnPostDTO,
    );
    this.notificationGateway.emitToUser(
      post?.user.id!,
      'notification:new',
      notification,
    );
    return comment;
  }

  async update(
    id: string,
    userId: string,
    updateCommentDTO: UpdateCommentOnPostDTO,
  ) {
    const comment = await this.commentRepo.findOne(id);
    if (!comment) throw new NotFoundException('Không tìm thấy bình luận');
    if (comment.userId !== userId)
      throw new ForbiddenException('Bạn không thể cập nhật bình luận này');
    return await this.commentRepo.update(id, updateCommentDTO);
  }

  async delete(id: string, userId: string) {
    const comment = await this.commentRepo.findOne(id);
    if (!comment) throw new NotFoundException('Không tìm thấy bình luận');
    if (comment.userId !== userId)
      throw new ForbiddenException('Bạn không thể xóa bình luận này');
    return await this.commentRepo.delete(id);
  }
}

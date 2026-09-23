import { Module } from '@nestjs/common';
import { UserRepository } from 'src/user/repos/user.repo';
import { WebsocketModule } from 'src/websocket/websocket.module';
import { CommentService } from './comment.service';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { CommentRepo } from './repos/comment.repo';
import { PostRepo } from './repos/post.repo';

@Module({
  imports: [WebsocketModule],
  controllers: [PostsController],
  providers: [
    PostsService,
    PostRepo,
    CommentService,
    CommentRepo,
    UserRepository,
  ],
})
export class PostsModule {}

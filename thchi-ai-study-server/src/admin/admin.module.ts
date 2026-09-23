import { Module } from '@nestjs/common';
import { AIModule } from 'src/ai-practice/AI.module';
import { PostRepo } from 'src/posts/repos/post.repo';
import { RankRepo } from 'src/rank/repo/rank.repo';
import { TopicRepo } from 'src/topic/repos/topic.repo';
import { WebsocketModule } from 'src/websocket/websocket.module';
import { WordRepo } from 'src/word/repos/word.repo';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminRepo } from './repos/admin.repo';

@Module({
  imports: [AIModule, WebsocketModule],
  controllers: [AdminController],
  providers: [AdminService, AdminRepo, TopicRepo, WordRepo, PostRepo, RankRepo],
})
export class AdminModule {}

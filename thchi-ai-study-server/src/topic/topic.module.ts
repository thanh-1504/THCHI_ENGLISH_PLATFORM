import { Module } from '@nestjs/common';
import { TopicController } from './topic.controller';
import { TopicService } from './topic.service';
import { TopicRepo } from './repos/topic.repo';

@Module({
  controllers: [TopicController],
  providers: [TopicService, TopicRepo],
  exports: [TopicRepo],
})
export class TopicModule {}

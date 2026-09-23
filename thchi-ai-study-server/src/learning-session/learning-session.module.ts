import { Module } from '@nestjs/common';
import { RankModule } from 'src/rank/rank.module';
import { WordRepo } from 'src/word/repos/word.repo';
import { LearningSessionController } from './learning-session.controller';
import { LearningSessionService } from './learning-session.service';
import { LearningSessionRepo } from './repos/learning-session.repo';

@Module({
  imports: [RankModule],
  controllers: [LearningSessionController],
  providers: [LearningSessionService, LearningSessionRepo, WordRepo],
})
export class LearningSessionModule {}

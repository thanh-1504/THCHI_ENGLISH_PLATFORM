import { Module } from '@nestjs/common';
import { RankModule } from 'src/rank/rank.module';
import { ReviewSessionRepo } from './repos/review-session.repo';
import { ReviewSessionController } from './review-session.controller';
import { ReviewSessionService } from './review-session.service';

@Module({
  imports: [RankModule],
  controllers: [ReviewSessionController],
  providers: [ReviewSessionService, ReviewSessionRepo],
})
export class ReviewSessionModule {}

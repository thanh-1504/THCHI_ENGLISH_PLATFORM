import { Injectable } from '@nestjs/common';
import { RankService } from 'src/rank/rank.service';
import { StreakService } from 'src/shared/services/streak.service';
import { ReviewSessionRepo } from './repos/review-session.repo';
import {
  CompleteReviewSessionType,
  CreateReviewSessionLogType,
} from './schemas/review-session.schema';

@Injectable()
export class ReviewSessionService {
  constructor(
    private readonly reviewSessionRepo: ReviewSessionRepo,
    private readonly streakService: StreakService,
    private readonly rankService: RankService,
  ) {}

  async getReviewSessionById(id: string) {
    return await this.reviewSessionRepo.getReviewSessionById(id);
  }

  async createReviewSession(userId: string) {
    return await this.reviewSessionRepo.create(userId);
  }

  async createReviewSessionLog(
    userId: string,
    reviewSessionId: string,
    createReviewSessionLog: CreateReviewSessionLogType,
  ) {
    return await this.reviewSessionRepo.createReviewSessionLog(
      userId,
      reviewSessionId,
      createReviewSessionLog,
    );
  }

  async complete(
    userId: string,
    sessionId: string,
    payload: CompleteReviewSessionType,
  ) {
    const compleReviewSession = await this.reviewSessionRepo.complete(
      userId,
      sessionId,
      payload,
    );
    await this.streakService.updateStreak(userId);
    await this.rankService.addXp(userId, 10);
    return compleReviewSession;
  }
}

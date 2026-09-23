import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RankService } from 'src/rank/rank.service';
import { RedisService } from 'src/shared/services/redis.service';
import { StreakService } from 'src/shared/services/streak.service';
import { WordRepo } from 'src/word/repos/word.repo';
import { LearningSessionRepo } from './repos/learning-session.repo';
import {
  CompleteLearningSessionType,
  CreateLearningLogType,
} from './schemas/learning-session.schema';

@Injectable()
export class LearningSessionService {
  constructor(
    private readonly learningSessionRepo: LearningSessionRepo,
    private readonly streakService: StreakService,
    private readonly rankService: RankService,
    private readonly configService: ConfigService,
    private readonly wordRepo: WordRepo,
    private readonly redisService: RedisService,
  ) {}
  async create(userId: string, topicId: string) {
    return await this.learningSessionRepo.createLearningSession(
      userId,
      topicId,
    );
  }

  async createLearningSessionLog(
    userId: string,
    createLearningSessionDTO: CreateLearningLogType,
  ) {
    return await this.learningSessionRepo.createLearningSessionLog(
      userId,
      createLearningSessionDTO,
    );
  }

  async updateLearningSession({
    userId,
    learningSessionId,
    completeLearningSessionDTO,
  }: {
    userId: string;
    learningSessionId: string;
    completeLearningSessionDTO: CompleteLearningSessionType;
  }) {
    const [learningSession] = await Promise.all([
      this.learningSessionRepo.updateLearningSession({
        userId,
        learningSessionId,
        payload: completeLearningSessionDTO,
      }),
      this.streakService.updateStreak(userId),
      this.rankService.addXp(
        userId,
        Number(this.configService.get<string>('XP_LEARNING')),
      ),
      this.redisService.client.zincrby(
        'leaderboard:xp:week',
        Number(this.configService.get<string>('XP_LEARNING')),
        userId,
      ),
    ]);
    return learningSession;
  }

  async findOne(id: string) {
    return await this.learningSessionRepo.findOne(id);
  }

  async checkAnswer(payload: { wordId: string; answer: string }) {
    const { wordId, answer } = payload;
    const word = await this.wordRepo.findOne(wordId);
    if (!word) {
      throw new NotFoundException('Không tìm thấy từ vựng này');
    }
    if (answer.trim().toLowerCase() === word.term.trim().toLowerCase())
      return {
        isCorrect: true,
      };

    return {
      isCorrect: false,
      answer,
      word: word.term,
    };
  }
}

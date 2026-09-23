import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import {
  CompleteLearningSessionType,
  CreateLearningLogType,
} from '../schemas/learning-session.schema';

@Injectable()
export class LearningSessionRepo {
  constructor(private readonly prismaService: PrismaService) {}
  createLearningSession(userId: string, topicId: string) {
    const learningSession = this.prismaService.learningSession.create({
      data: {
        userId: userId,
        topicId: topicId,
      },
    });
    return learningSession;
  }

  createLearningSessionLog(userId: string, payload: CreateLearningLogType) {
    const learningSessionLog = this.prismaService.learningLog.create({
      data: {
        userId,
        learningSessionId: payload.learningSessionId,
        wordId: payload.wordId,
        step: payload.step,
        isCorrect: payload.isCorrect,
        attemptCount: payload.attemptCount,
      },
    });
    return learningSessionLog;
  }

  updateLearningSession({
    userId,
    learningSessionId,
    payload,
  }: {
    userId: string;
    learningSessionId: string;
    payload: CompleteLearningSessionType;
  }) {
    return this.prismaService.$transaction(async (tx) => {
      const session = await tx.learningSession.update({
        where: {
          id: learningSessionId,
          userId,
        },
        data: {
          completedAt: new Date(),
          wordsCount: payload.wordsCount,
          xpEarned: payload.xpEarned,
        },
      });
      return session;
    });
  }

  findOne(id: string) {
    return this.prismaService.learningSession.findUnique({
      where: {
        id,
      },
    });
  }
}

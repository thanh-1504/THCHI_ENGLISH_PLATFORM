import { Injectable, NotFoundException } from '@nestjs/common';
import { WordStatus } from 'generated/prisma/enums';
import { PrismaService } from 'src/shared/services/prisma.service';
import {
  CompleteReviewSessionType,
  CreateReviewSessionLogType,
} from '../schemas/review-session.schema';
import { calculateSM2 } from '../utils/sm2.util';

@Injectable()
export class ReviewSessionRepo {
  constructor(private readonly prismaService: PrismaService) {}

  getReviewSessionById(id: string) {
    return this.prismaService.reviewSession.findUnique({
      where: { id },
    });
  }

  async create(userId: string) {
    const existingReviewSession =
      await this.prismaService.reviewSession.findFirst({
        where: { userId, completedAt: null },
      });
    if (existingReviewSession) {
      return existingReviewSession;
    }
    return this.prismaService.reviewSession.create({
      data: {
        userId,
      },
    });
  }

  createReviewSessionLog(
    userId: string,
    reviewSessionId: string,
    payload: CreateReviewSessionLogType,
  ) {
    return this.prismaService.$transaction(async (tx) => {
      await tx.reviewLog.create({
        data: { ...payload, userId, reviewSessionId },
      });
      const notebookEntry = await tx.notebookEntry.findUnique({
        where: { id: payload.notebookEntryId },
      });

      if (!notebookEntry)
        throw new NotFoundException('Notebook entry not found');

      const sm2Result = calculateSM2({
        easeFactor: notebookEntry.easeFactor,
        intervalDays: notebookEntry.intervalDays,
        reviewCount: notebookEntry.reviewCount,
        isCorrect: payload.isCorrect,
      });
      const updatedNotebookEntry = await tx.notebookEntry.update({
        where: {
          id: payload.notebookEntryId,
        },
        data: {
          ...sm2Result,
          status: payload.isCorrect ? WordStatus.ACTIVE : WordStatus.SLEEPING,
        },
      });
      return updatedNotebookEntry;
    });
  }

  async complete(
    userId: string,
    sessionId: string,
    payload: CompleteReviewSessionType,
  ) {
    return this.prismaService.$transaction(async (tx) => {
      const completedSession = await tx.reviewSession.update({
        where: { id: sessionId, userId },
        data: {
          ...payload,
          completedAt: new Date(),
        },
      });

      const reviewLogs = await tx.reviewLog.findMany({
        where: { reviewSessionId: sessionId },
        select: { notebookEntryId: true },
        distinct: ['notebookEntryId'],
      });

      const entryIds = reviewLogs.map((log) => log.notebookEntryId);

      if (entryIds.length > 0) {
        const oneHourLater = new Date();
        oneHourLater.setHours(oneHourLater.getHours() + 1);
        await tx.notebookEntry.updateMany({
          where: {
            id: { in: entryIds },
            nextReviewAt: { lte: new Date() },
          },
          data: {
            nextReviewAt: oneHourLater,
            status: WordStatus.ACTIVE,
          },
        });
      }
      return completedSession;
    });
  }
}

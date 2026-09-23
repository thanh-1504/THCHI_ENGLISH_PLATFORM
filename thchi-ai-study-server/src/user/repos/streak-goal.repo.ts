import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class StreakGoalRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findInProgressGoalByUserId(userId: string) {
    return this.prismaService.streakGoal.findFirst({
      where: { userId, status: 'IN_PROGRESS' },
      select: { id: true },
    });
  }

  findAllActiveConfigs() {
    return this.prismaService.goalRewardConfig.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: 'asc' },
      select: { id: true, targetDays: true, shieldReward: true },
    });
  }

  async createGoal(userId: string, configId: string) {
    return this.prismaService.$transaction(async (tx) => {
      const existing = await tx.streakGoal.findFirst({
        where: { userId, status: 'IN_PROGRESS' },
        select: { id: true },
      });
      if (existing) {
        throw new ConflictException(
          'Bạn đang có một mục tiêu streak đang thực hiện',
        );
      }

      const config = await tx.goalRewardConfig.findUniqueOrThrow({
        where: { id: configId },
      });

      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + config.targetDays);

      return tx.streakGoal.create({
        data: {
          userId,
          configId,
          targetDays: config.targetDays,
          shieldReward: config.shieldReward,
          targetDate,
        },
      });
    });
  }
}

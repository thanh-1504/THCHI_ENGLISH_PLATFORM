import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { differenceInCalendarDays } from 'date-fns';
import { GoalStatus } from 'generated/prisma/enums';
import { MailService } from './mail.service';
import { PrismaService } from './prisma.service';
@Injectable()
export class StreakService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async getUserStreak(userId: string) {
    return this.prismaService.userStreak.findUnique({
      where: { userId },
    });
  }

  async updateStreak(userId: string) {
    const streakUser = await this.prismaService.userStreak.findUnique({
      where: { userId },
    });

    if (!streakUser) {
      return await this.prismaService.userStreak.create({
        data: {
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastStudiedDate: new Date(),
        },
      });
    }

    const diffDays = differenceInCalendarDays(
      new Date(),
      streakUser.lastStudiedDate!,
    );

    const missedDays = diffDays - 1;

    if (diffDays === 0) return;
    if (diffDays === 1) {
      const newStreak = streakUser.currentStreak + 1;
      await this.prismaService.userStreak.update({
        where: { userId },
        data: {
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, streakUser.longestStreak),
          lastStudiedDate: new Date(),
        },
      });
    }
    if (missedDays >= 1) {
      if (streakUser.streakShieldCount >= missedDays) {
        await this.prismaService.userStreak.update({
          where: { userId },
          data: {
            streakShieldCount: { decrement: missedDays },
            lastStudiedDate: new Date(),
          },
        });
      } else {
        // Streak bị reset → mark goal FAILED ngay, không chờ cron
        await this.prismaService.$transaction([
          this.prismaService.userStreak.update({
            where: { userId },
            data: {
              currentStreak: 1,
              lastStudiedDate: new Date(),
            },
          }),
          this.prismaService.streakGoal.updateMany({
            where: { userId, status: GoalStatus.IN_PROGRESS },
            data: { status: GoalStatus.FAILED },
          }),
        ]);
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_7PM, { timeZone: 'Asia/Ho_Chi_Minh' })
  async remindProtectStreak() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const users = await this.prismaService.userStreak.findMany({
      where: {
        currentStreak: { gt: 0 },
        lastStudiedDate: { lt: today },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    await Promise.all(
      users.map((user) =>
        this.mailService
          .sendMailRemindStreakUser(user.user.email)
          .catch(() => console.log('Gửi mail thất bại')),
      ),
    );
  }

  @Cron('5 0 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async resetStreak() {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - 1);
    targetDate.setHours(0, 0, 0, 0);

    // Reset streak về 0 đối với user nào bỏ lỡ học và không có streak shield
    const usersToReset = await this.prismaService.userStreak.findMany({
      where: {
        currentStreak: { gt: 0 },
        lastStudiedDate: { lt: targetDate },
        streakShieldCount: 0,
      },
      select: {
        userId: true,
      },
    });
    await this.prismaService.userStreak.updateMany({
      where: {
        userId: { in: usersToReset.map((user) => user.userId) },
      },
      data: {
        currentStreak: 0,
      },
    });
    if (usersToReset.length > 0) {
      await this.prismaService.streakGoal.updateMany({
        where: {
          userId: { in: usersToReset.map((user) => user.userId) },
          status: GoalStatus.IN_PROGRESS,
        },
        data: {
          status: GoalStatus.FAILED,
        },
      });
    }

    const users = await this.prismaService.userStreak.findMany({
      where: {
        currentStreak: { gt: 0 },
        lastStudiedDate: { lt: targetDate },
        streakShieldCount: { gt: 0 },
      },
    });
    await Promise.all(
      users.map(async (user) => {
        const missedDays =
          differenceInCalendarDays(new Date(), user.lastStudiedDate!) - 1;
        if (missedDays <= 0) return;
        if (user.streakShieldCount >= missedDays) {
          await this.prismaService.userStreak.update({
            where: {
              userId: user.userId,
            },
            data: {
              streakShieldCount: { decrement: missedDays },
            },
          });
        } else {
          await this.prismaService.userStreak.update({
            where: {
              userId: user.userId,
            },
            data: {
              currentStreak: 0,
              streakShieldCount: 0,
            },
          });
          await this.prismaService.streakGoal.updateMany({
            where: {
              userId: user.userId,
              status: GoalStatus.IN_PROGRESS,
            },
            data: {
              status: GoalStatus.FAILED,
            },
          });
        }
      }),
    );
  }

  @Cron('10 0 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async completeStreakGoals() {
    const now = new Date();
    const goalsToComplete = await this.prismaService.streakGoal.findMany({
      where: {
        status: 'IN_PROGRESS',
        targetDate: { lte: now },
      },
    });

    await Promise.all(
      goalsToComplete.map((goal) =>
        this.prismaService.$transaction([
          this.prismaService.streakGoal.update({
            where: { id: goal.id },
            data: { status: 'COMPLETED', completedAt: now },
          }),
          this.prismaService.userStreak.update({
            where: { userId: goal.userId },
            data: { streakShieldCount: { increment: goal.shieldReward } },
          }),
        ]),
      ),
    );
  }
}

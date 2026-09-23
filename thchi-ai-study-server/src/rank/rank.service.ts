import { BadRequestException, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Prisma } from 'generated/prisma/client';
import { RankTier } from 'generated/prisma/enums';
import { NextTier, PrevTier } from 'src/shared/constant/rank.constant';
import { PrismaService } from 'src/shared/services/prisma.service';
import { RedisService } from 'src/shared/services/redis.service';
import { RankRepo } from './repo/rank.repo';

@Injectable()
export class RankService {
  constructor(
    private readonly rankRepo: RankRepo,
    private readonly redisService: RedisService,
    private readonly prismaService: PrismaService,
  ) {}

  private async addXpToLeaderboard(userId: string, xp: number) {
    await this.redisService.client.zincrby('leaderboard:xp:week', xp, userId);
    await this.redisService.client.del('leaderboard:cache:top');
  }

  private async getTopLeaderBoard(limit = 10) {
    const entries: { userId: string; xpThisWeek: number }[] = [];
    const cached = await this.redisService.client.get('leaderboard:cache:top');
    if (cached) return JSON.parse(cached);

    const raw = await this.redisService.client.zrevrange(
      'leaderboard:xp:week',
      0,
      limit - 1,
      'WITHSCORES',
    );
    for (let i = 0; i < raw.length; i += 2) {
      entries.push({
        userId: raw[i],
        xpThisWeek: +raw[i + 1],
      });
    }
    if (entries.length === 0) return [];
    const userIds = entries.map((entry) => entry.userId);
    const users = await this.prismaService.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
      },
    });
    const nameMap = new Map(users.map((u) => [u.id, u.name]));
    const result = entries.map((entry) => ({
      userId: entry.userId,
      xpThisWeek: entry.xpThisWeek,
      name: nameMap.get(entry.userId),
    }));
    await this.redisService.client.set(
      'leaderboard:cache:top',
      JSON.stringify(result),
      'EX',
      60,
    );
    return result;
  }

  private async getMyRank(userId: string) {
    const [rank, score] = await Promise.all([
      this.redisService.client.zrevrank('leaderboard:xp:week', userId),
      this.redisService.client.zscore('leaderboard:xp:week', userId),
    ]);
    return {
      rank: rank ? rank + 1 : null,
      xp: score ? +score : 0,
    };
  }

  async getRankBoard(userId: string) {
    const userRank = await this.rankRepo.getUserRank(userId);

    if (!userRank) throw new BadRequestException('Người dùng chưa học bài nào');

    const [topLeaderboard, myRank, userStreak, notebook] = await Promise.all([
      this.getTopLeaderBoard(3),
      this.getMyRank(userId),
      this.prismaService.userStreak.findUnique({ where: { userId } }),
      this.prismaService.notebook.findUnique({
        where: { userId },
        select: { totalWordsSaved: true },
      }),
    ]);

    return {
      currentUser: {
        name: userRank.user.name,
        streak: userStreak?.currentStreak ?? 0,
        currentTier: userRank.currentTier,
        totalWordsSaved: notebook?.totalWordsSaved ?? 0,
        ...myRank,
      },
      top3: topLeaderboard,
    };
  }

  async addXp(userId: string, xp: number) {
    await this.addXpToLeaderboard(userId, xp);
    return await this.rankRepo.addXp(userId, xp);
  }

  @Cron('0 0 0 * * 0', {
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  // @Cron('* * * * *', {
  //   timeZone: 'Asia/Ho_Chi_Minh',
  // })
  async handleResetRankWeekly() {
    const tierConfigs = await this.rankRepo.getConfigRankTier();
    const tierMap = new Map(tierConfigs.map((tier) => [tier.tier, tier]));
    const promotionMap = new Map<RankTier, string[]>();
    const demotionMap = new Map<RankTier, string[]>();
    for (const tier of tierConfigs) {
      const nextTier = NextTier[tier.tier];
      const prevTier = PrevTier[tier.tier];
      const nextTierConfig = tierMap.get(nextTier);
      const usersInTier = await this.rankRepo.getUserRankByTier(tier.tier);
      for (const user of usersInTier) {
        const canPromote = tier.tier !== nextTier;
        if (
          canPromote &&
          nextTierConfig &&
          user.xpThisWeek >= nextTierConfig.xpRequired
        ) {
          const ids = promotionMap.get(nextTier) ?? [];
          ids.push(user.userId);
          promotionMap.set(nextTier, ids);
        } else if (user.xpThisWeek < tier.xpToMaintain) {
          const ids = demotionMap.get(prevTier) ?? [];
          ids.push(user.userId);
          demotionMap.set(prevTier, ids);
        }
      }
    }
    const prismaTasks: Prisma.PrismaPromise<any>[] = [];
    for (const [tier, userIds] of promotionMap.entries()) {
      if (userIds.length > 0) {
        prismaTasks.push(this.rankRepo.updateRank(userIds, tier));
      }
    }
    for (const [tier, userIds] of demotionMap.entries()) {
      if (userIds.length > 0) {
        prismaTasks.push(this.rankRepo.updateRank(userIds, tier));
      }
    }
    prismaTasks.push(this.rankRepo.resetXP());
    await this.prismaService.$transaction(prismaTasks);
    await this.redisService.client.del('leaderboard:xp:week');
    await this.redisService.client.del('leaderboard:cache:top');
  }
}

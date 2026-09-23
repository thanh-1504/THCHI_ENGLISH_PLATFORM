import { Injectable } from '@nestjs/common';
import { UserRank } from 'generated/prisma/client';
import { RankTier } from 'generated/prisma/enums';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class RankRepo {
  constructor(private readonly prismaService: PrismaService) {}

  getUserRank(userId: string) {
    return this.prismaService.userRank.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            name: true,
            profile: { select: { avatarUrl: true } },
          },
        },
      },
    });
  }

  getUserRankByTier(tier: RankTier) {
    return this.prismaService.userRank.findMany({
      where: { currentTier: tier },
    });
  }

  getRankTier(query: { tier: RankTier } | { id: string }) {
    return this.prismaService.rankTierConfig.findUnique({
      where: query,
    });
  }

  getTop3UserByTier(tier: RankTier) {
    return this.prismaService.userRank.findMany({
      where: { currentTier: tier },
      orderBy: { xpThisWeek: 'desc' },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      take: 3,
    });
  }

  getUserRankAbove(userRank: UserRank) {
    return this.prismaService.userRank.findMany({
      where: {
        currentTier: userRank.currentTier,
        xpThisWeek: { gt: userRank.xpThisWeek },
      },
      include: {
        user: {
          select: { name: true, profile: { select: { avatarUrl: true } } },
        },
      },
      orderBy: { xpThisWeek: 'desc' },
      take: 3,
    });
  }

  getUserRankBelow(userRank: UserRank) {
    return this.prismaService.userRank.findMany({
      where: {
        currentTier: userRank.currentTier,
        xpThisWeek: { lt: userRank.xpThisWeek },
      },
      include: {
        user: {
          select: { name: true, profile: { select: { avatarUrl: true } } },
        },
      },
      orderBy: { xpThisWeek: 'desc' },
      take: 3,
    });
  }

  getUsersRank() {
    return this.prismaService.userRank.findMany();
  }

  getConfigRankTier() {
    return this.prismaService.rankTierConfig.findMany();
  }

  addXp(userId: string, xp: number) {
    return this.prismaService.userRank.upsert({
      where: { userId: userId },
      update: {
        xpThisWeek: {
          increment: xp,
        },
        xpTotal: {
          increment: xp,
        },
      },
      create: {
        userId: userId,
        xpThisWeek: xp,
        xpTotal: xp,
      },
    });
  }

  resetXP() {
    return this.prismaService.userRank.updateMany({
      data: {
        xpThisWeek: 0,
      },
    });
  }

  updateRank(userIds: string[], tier: RankTier) {
    return this.prismaService.userRank.updateMany({
      where: {
        userId: {
          in: userIds,
        },
      },
      data: {
        currentTier: tier,
      },
    });
  }
}

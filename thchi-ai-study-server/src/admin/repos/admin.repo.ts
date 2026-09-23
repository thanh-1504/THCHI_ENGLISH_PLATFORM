import { Injectable } from '@nestjs/common';
import { TransactionStatus } from 'generated/prisma/enums';
import { PrismaService } from 'src/shared/services/prisma.service';
import { CreateUserAdminType, UpdateStatusAccountType } from '../schemas/admin.schema';

@Injectable()
export class AdminRepo {
  constructor(private readonly prismaService: PrismaService) {}
  async getUsers({ skip, take, where }) {
    const [total, users] = await Promise.all([
      this.prismaService.user.count({ where }),
      this.prismaService.user.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    return { total, users };
  }

  createUser(data: CreateUserAdminType) {
    return this.prismaService.user.create({
      data,
    });
  }

  getUserDetail(id: string) {
    return this.prismaService.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        notebook: { select: { totalWordsSaved: true } },
        profile: {
          select: { avatarUrl: true },
        },

        subscription: {
          select: {
            startDate: true,
            endDate: true,
            isActive: true,
            plan: {
              select: { name: true },
            },
          },
        },
        _count: {
          select: {
            courseEnrollments: true,
          },
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
            plan: { select: { name: true } }
          }
        }
      },
    });
  }

  getDashboardStats() {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    const results = Promise.all([
      // Tổng user
      this.prismaService.user.count(),
      // Tổng user premium
      this.prismaService.subscription.count({
        where: { isActive: true },
      }),
      // Tổng doanh thu
      this.prismaService.transaction.aggregate({
        where: { status: TransactionStatus.SUCCESS },
        _sum: {
          amount: true,
        },
      }),

      // Tổng khóa học
      this.prismaService.course.count({ where: { deletedAt: null } }),
      // Tổng Topic
      this.prismaService.topic.count({ where: { deletedAt: null } }),
      // Người dùng mới hôm nay
      this.prismaService.user.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      }),
    ]);
    return results;
  }

  getTopCourse() {
    return this.prismaService.course.findMany({
      where: { deletedAt: null },
      select: {
        title: true,
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: {
        enrollments: { _count: 'desc' },
      },
      take: 3,
    });
  }

  getLatestTransactions() {
    return this.prismaService.transaction.findMany({
      select: {
        user: { select: { email: true } },
        amount: true,
        status: true,
        plan: { select: { name: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 3,
    });
  }

  async getTransactions({ skip, take, where }) {
    const [total, transactions] = await Promise.all([
      this.prismaService.transaction.count({ where }),
      this.prismaService.transaction.findMany({
        where,
        skip,
        take,
        include: {
          plan: { select: { name: true } },
          user: { select: { email: true, name: true } },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);
    return { total, transactions };
  }

  getTransactionDetail(id: string) {
    return this.prismaService.transaction.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            id: true,
            subscription: {
              select: { startDate: true, endDate: true, isActive: true },
            },
          },
        },
        plan: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  updateUserStatus(userId: string, payload: UpdateStatusAccountType) {
    return this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        status: payload.status,
      },
    });
  }

  async getMonthlyRevenue() {
    const result = await this.prismaService.$queryRaw<
      Array<{ month: string; revenue: number }>
    >`
      SELECT
        TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') AS month,
        COALESCE(SUM(amount), 0)::float AS revenue
      FROM transactions
      WHERE
        status = 'SUCCESS'
        AND "createdAt" >= DATE_TRUNC('month', NOW() - INTERVAL '5 months')
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY DATE_TRUNC('month', "createdAt") ASC
    `;
    return result;
  }

  getTopTopics() {
    return this.prismaService.topic.findMany({
      where: { deletedAt: null },
      select: {
        title: true,
        _count: {
          select: { learningSessions: true },
        },
      },
      orderBy: {
        learningSessions: { _count: 'desc' },
      },
      take: 3,
    });
  }

  // ── RankTierConfig ────────────────────────────────────────────────────────────
  getRankTierConfigs() {
    return this.prismaService.rankTierConfig.findMany({
      orderBy: { xpRequired: 'asc' },
    });
  }

  createRankTierConfig(data: {
    tier: string;
    xpRequired: number;
    xpToMaintain: number;
    description?: string;
  }) {
    return this.prismaService.rankTierConfig.create({ data: data as any });
  }

  updateRankTierConfig(
    id: string,
    data: { xpRequired?: number; xpToMaintain?: number; description?: string },
  ) {
    return this.prismaService.rankTierConfig.update({ where: { id }, data });
  }

  deleteRankTierConfig(id: string) {
    return this.prismaService.rankTierConfig.delete({ where: { id } });
  }
}

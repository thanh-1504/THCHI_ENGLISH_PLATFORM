import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'generated/prisma/browser';
import { PostRepo } from 'src/posts/repos/post.repo';
import { RankRepo } from 'src/rank/repo/rank.repo';
import { HashingService } from 'src/shared/services/hashing.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { RedisService } from 'src/shared/services/redis.service';
import { TopicRepo } from 'src/topic/repos/topic.repo';
import { NotificationGateway } from 'src/websocket/notification.gateway';
import { WordRepo } from 'src/word/repos/word.repo';
import { AdminRepo } from './repos/admin.repo';
import {
  CreateRankTierConfigType,
  CreateTopicAdminType,
  CreateUserAdminType,
  UpdateRankTierConfigType,
  UpdateStatusAccountType,
} from './schemas/admin.schema';
import {
  PaginationPostAdminType,
  PaginationTransactionType,
  PaginationUserAdminType,
} from './schemas/pagination.schema';

@Injectable()
export class AdminService {
  constructor(
    private readonly adminRepo: AdminRepo,
    private readonly topicRepo: TopicRepo,
    private readonly hashingService: HashingService,
    private readonly prismaService: PrismaService,
    private readonly wordRepo: WordRepo,
    private readonly postRepo: PostRepo,
    private readonly rankRepo: RankRepo,
    private readonly notificationGateway: NotificationGateway,
    private readonly redisService: RedisService,
  ) {}

  async seedLeaderboardFromPostgres() {
    const allRanks = await this.prismaService.userRank.findMany({
      select: { userId: true, xpThisWeek: true },
    });

    const pipeline = this.redisService.client.pipeline();
    for (const rank of allRanks) {
      pipeline.zadd('leaderboard:xp:week', rank.xpThisWeek, rank.userId);
    }
    await pipeline.exec();

    return { seeded: allRanks.length };
  }

  async getUsers(query: PaginationUserAdminType) {
    const { page, limit, name_email, role, status } = query;
    const take = limit || 10;
    const skip = (page - 1) * take;
    const where: Prisma.UserWhereInput = {};

    if (name_email) {
      where.OR = [
        { email: { contains: name_email, mode: 'insensitive' } },
        { name: { contains: name_email, mode: 'insensitive' } },
      ];
    }

    if (role) where.role = role;

    if (status) {
      where.status = status;
    }
    const { total, users } = await this.adminRepo.getUsers({
      skip,
      take,
      where,
    });
    return {
      total,
      page,
      limit,
      users,
    };
  }

  async getUserDetail(id: string) {
    const userDetail = await this.adminRepo.getUserDetail(id);
    if (!userDetail)
      throw new NotFoundException('Không tìm thấy hồ sơ người dùng');
    return {
      id: userDetail.id,
      name: userDetail.name,
      email: userDetail.email,
      role: userDetail.role,
      status: userDetail.status,
      avatarUrl: userDetail.profile?.avatarUrl,
      premiumPlan: {
        startDate: userDetail.subscription?.startDate,
        endDate: userDetail.subscription?.endDate,
        isActive: userDetail.subscription?.isActive,
        name: userDetail.subscription?.plan?.name,
      },
      stats: {
        totalCourses: userDetail._count.courseEnrollments,
        totalWordsSaved: userDetail.notebook?.totalWordsSaved ?? 0,
      },
      transactions: userDetail.transactions.map((t) => ({
        id: t.id,
        amount: t.amount,
        status: t.status,
        plan: t.plan?.name,
        createdAt: t.createdAt,
      })),
      createdAt: userDetail.createdAt,
    };
  }

  async updateUserStatus(userId: string, status: UpdateStatusAccountType) {
    return await this.adminRepo.updateUserStatus(userId, status);
  }

  async getDashboardStats() {
    const [
      totalUsers,
      premiumUsers,
      totalRevenue,
      totalCourses,
      totalTopics,
      newUsersToday,
    ] = await this.adminRepo.getDashboardStats();

    return {
      totalUsers,
      premiumUsers,
      freeUsers: totalUsers - premiumUsers,
      totalRevenue: totalRevenue._sum.amount,
      totalCourses,
      totalTopics,
      newUsersToday,
    };
  }

  async getTopCourse() {
    const result = await this.adminRepo.getTopCourse();
    return result.map((item) => ({
      title: item.title,
      enrollmentCount: item._count.enrollments,
    }));
  }

  async getLatestTransactions() {
    const result = await this.adminRepo.getLatestTransactions();
    return result.map((item) => ({
      email: item.user.email,
      amount: item.amount,
      plan: item.plan.name,
      status: item.status,
    }));
  }

  async getMonthlyRevenue() {
    const MONTH_NAMES: Record<string, string> = {
      '01': 'Tháng 1',
      '02': 'Tháng 2',
      '03': 'Tháng 3',
      '04': 'Tháng 4',
      '05': 'Tháng 5',
      '06': 'Tháng 6',
      '07': 'Tháng 7',
      '08': 'Tháng 8',
      '09': 'Tháng 9',
      '10': 'Tháng 10',
      '11': 'Tháng 11',
      '12': 'Tháng 12',
    };
    const raw = await this.adminRepo.getMonthlyRevenue();
    return raw.map((row) => ({
      month: MONTH_NAMES[row.month.split('-')[1]] ?? row.month,
      revenue: Number(row.revenue),
    }));
  }

  async getTopTopics() {
    const result = await this.adminRepo.getTopTopics();
    return result.map((item, index) => ({
      rank: index + 1,
      name: item.title,
      learnerCount: item._count.learningSessions,
    }));
  }

  async getTransactions(query: PaginationTransactionType) {
    const { page, limit, search, planName, status, fromDate, toDate } = query;
    const take = limit || 10;
    const skip = (page - 1) * take;
    const where: Prisma.TransactionWhereInput = {};
    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }
    if (planName)
      where.plan = { name: { contains: planName, mode: 'insensitive' } };
    if (status) where.status = status;
    if (fromDate && toDate) {
      where.createdAt = {
        gte: new Date(fromDate),
        lte: new Date(toDate + 'T23:59:59.999Z'),
      };
    } else if (fromDate) {
      where.createdAt = { gte: new Date(fromDate) };
    } else if (toDate) {
      where.createdAt = { lte: new Date(toDate + 'T23:59:59.999Z') };
    }
    const { total, transactions } = await this.adminRepo.getTransactions({
      skip,
      take,
      where,
    });
    return {
      total,
      page,
      limit,
      data: transactions.map((item) => ({
        id: item.id,
        code: item.id.substring(0, 8).toUpperCase(),
        email: item.user?.email,
        fullName: item.user?.name,
        plan: item.plan.name,
        amount: item.amount,
        method: item.paymentGateway || 'N/A',
        status: item.status,
        createdAt: item.createdAt,
      })),
    };
  }

  async getTransactionDetail(id: string) {
    const result = await this.adminRepo.getTransactionDetail(id);
    if (!result) throw new NotFoundException('Không tìm thấy giao dịch này');
    return result;
  }

  async createUser(payload: CreateUserAdminType) {
    const { name, email, password, role } = payload;
    const existingUser = await this.adminRepo.getUsers({
      skip: 0,
      take: 1,
      where: { email },
    });
    if (existingUser.total > 0) {
      throw new BadRequestException('Email đã tồn tại');
    }
    const hashedPassword = await this.hashingService.hashPassword(password);
    return await this.adminRepo.createUser({
      name,
      email,
      password: hashedPassword,
      role,
    });
  }

  async createTopic({
    courseId,
    payload,
  }: {
    courseId: string;
    payload: CreateTopicAdminType;
  }) {
    const { topic, wordList } = payload;
    return await this.prismaService.$transaction(async (tx) => {
      const result: any[] = [];
      const newTopic = await this.topicRepo.create({
        ...topic,
        courseId,
      });
      for (const [index, word] of wordList.entries()) {
        const newWord =
          await this.wordRepo.createWordWithDefinitionsAndExamples(tx, word);
        const newTopicWord = await tx.topicWord.create({
          data: {
            wordId: newWord.id ?? '',
            topicId: newTopic.id,
            orderIndex: index,
            imageUrl: word.imageUrl,
          },
        });
        result.push(newTopicWord);
      }
      return result;
    });
  }

  async getPosts(query: PaginationPostAdminType) {
    const { page, limit, title, status, fromDate, toDate } = query;
    const take = limit || 10;
    const skip = (page - 1) * take;
    const where: Prisma.PostWhereInput = { deletedAt: null };

    if (title) {
      where.title = { contains: title, mode: 'insensitive' };
    }
    if (status) where.status = status;
    if (fromDate && toDate) {
      where.createdAt = {
        gte: new Date(fromDate),
        lte: new Date(toDate + 'T23:59:59.999Z'),
      };
    } else if (fromDate) {
      where.createdAt = { gte: new Date(fromDate) };
    } else if (toDate) {
      where.createdAt = { lte: new Date(toDate + 'T23:59:59.999Z') };
    }

    const [total, posts] = await Promise.all([
      this.prismaService.post.count({ where }),
      this.prismaService.post.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          status: true,
          imageUrl: true,
          createdAt: true,
          reviewedAt: true,
          _count: { select: { likes: true, comments: true } },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profile: { select: { avatarUrl: true, displayName: true } },
            },
          },
        },
      }),
    ]);

    return {
      total,
      page,
      limit,
      data: posts.map((post) => ({
        id: post.id,
        title: post.title,
        status: post.status,
        imageUrl: post.imageUrl,
        createdAt: post.createdAt,
        reviewedAt: post.reviewedAt,
        likes: post._count.likes,
        comments: post._count.comments,
        author: {
          id: post.user.id,
          name: post.user.name,
          email: post.user.email,
          avatarUrl: post.user.profile?.avatarUrl ?? '',
          displayName: post.user.profile?.displayName ?? post.user.name,
        },
      })),
    };
  }

  async deletePost(id: string) {
    const post = await this.postRepo.findOne(id);
    if (!post) throw new NotFoundException('Không tìm thấy bài viết này');
    return this.postRepo.remove(id);
  }

  async updatePostStatus(id: string, status: string) {
    const post = await this.postRepo.findOne(id);
    if (!post) throw new NotFoundException('Không tìm thấy bài viết này');
    const [review, notification] = await this.postRepo.review(
      id,
      post.user.id,
      {
        status: status as any,
      },
    );
    this.notificationGateway.emitToUser(
      post.user.id,
      'notification:new',
      notification,
    );
    return review;
  }

  // ── RankTierConfig ────────────────────────────────────────────────────────────
  async getRankTierConfigs() {
    return this.adminRepo.getRankTierConfigs();
  }

  async createRankTierConfig(payload: CreateRankTierConfigType) {
    const existing = await this.rankRepo.getRankTier({ tier: payload.tier });
    if (existing) {
      throw new BadRequestException(`Tier ${payload.tier} đã tồn tại`);
    }
    return this.adminRepo.createRankTierConfig(payload);
  }

  async updateRankTierConfig(id: string, payload: UpdateRankTierConfigType) {
    const existing = await this.rankRepo.getRankTier({ id });
    if (!existing)
      throw new NotFoundException('Không tìm thấy cấu hình xếp hạng');
    return this.adminRepo.updateRankTierConfig(id, payload);
  }

  async deleteRankTierConfig(id: string) {
    const existing = await this.rankRepo.getRankTier({ id });
    if (!existing)
      throw new NotFoundException('Không tìm thấy cấu hình xếp hạng');
    return this.adminRepo.deleteRankTierConfig(id);
  }
}

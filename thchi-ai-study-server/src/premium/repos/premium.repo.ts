import { Injectable } from '@nestjs/common';
import { PremiumDuration } from 'generated/prisma/enums';
import { PrismaService } from 'src/shared/services/prisma.service';
import {
  CreatePremiumPlanType,
  UpdatePremiumPlanType,
} from '../schemas/premium.schema';

@Injectable()
export class PremiumRepo {
  constructor(private readonly prismaService: PrismaService) {}

  getSubscription(userId: string) {
    return this.prismaService.subscription.findUnique({
      where: {
        userId,
      },
    });
  }

  findOne(id: string) {
    return this.prismaService.premiumPlan.findUnique({
      where: { id, deletedAt: null },
    });
  }

  findByDuration(duration: PremiumDuration) {
    return this.prismaService.premiumPlan.findUnique({
      where: { duration, deletedAt: null },
    });
  }

  async getAllPlans(skip: number = 0, take: number = 10) {
    const [total, data] = await Promise.all([
      this.prismaService.premiumPlan.count({
        where: { deletedAt: null },
      }),
      this.prismaService.premiumPlan.findMany({
        where: { deletedAt: null },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return {
      total,
      data,
    };
  }

  createPremiumPlan(name: string, payload: CreatePremiumPlanType) {
    return this.prismaService.premiumPlan.create({
      data: {
        name,
        ...payload,
      },
    });
  }

  updatePremiumPlan(id: string, payload: UpdatePremiumPlanType) {
    return this.prismaService.premiumPlan.update({
      where: { id, deletedAt: null },
      data: payload,
    });
  }

  togglePlanStatus(id: string, currentStatus: boolean) {
    return this.prismaService.premiumPlan.update({
      where: { id, deletedAt: null },
      data: { isActive: !currentStatus },
    });
  }
}

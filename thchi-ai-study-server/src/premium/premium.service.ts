import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PremiumDuration } from 'generated/prisma/enums';
import { PremiumRepo } from './repos/premium.repo';
import {
  CreatePremiumPlanType,
  UpdatePremiumPlanType,
} from './schemas/premium.schema';

@Injectable()
export class PremiumService {
  constructor(private readonly premiumRepo: PremiumRepo) {}

  async getAllPlans(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const { total, data } = await this.premiumRepo.getAllPlans(skip, limit);
    return {
      total,
      page,
      limit,
      data,
    };
  }

  async createPremiumPlan(payload: CreatePremiumPlanType) {
    const existingPlan = await this.premiumRepo.findByDuration(
      payload.duration,
    );
    if (existingPlan) {
      throw new BadRequestException('Gói với thời hạn này đã tồn tại');
    }

    let generatedName = '';
    switch (payload.duration) {
      case PremiumDuration.THREE_MONTHS:
        generatedName = 'Gói 3 tháng';
        break;
      case PremiumDuration.ONE_YEAR:
        generatedName = 'Gói 1 năm';
        break;
    }
    return await this.premiumRepo.createPremiumPlan(generatedName, payload);
  }

  async updatePremiumPlan(id: string, payload: UpdatePremiumPlanType) {
    const existPremium = await this.premiumRepo.findOne(id);
    if (!existPremium)
      throw new NotFoundException('Không tìm thấy gói premim này');
    return await this.premiumRepo.updatePremiumPlan(id, payload);
  }

  async togglePlanStatus(id: string) {
    const existPremium = await this.premiumRepo.findOne(id);
    if (!existPremium)
      throw new NotFoundException('Không tìm thấy gói premim này');
    return await this.premiumRepo.togglePlanStatus(id, existPremium.isActive);
  }
}

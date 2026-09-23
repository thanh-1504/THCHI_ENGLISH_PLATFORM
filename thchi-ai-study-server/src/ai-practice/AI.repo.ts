import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class AIRepo {
  constructor(private readonly prismaService: PrismaService) {}

  getTodayUsage(userId: string, today: Date) {
    return this.prismaService.aiPracticeUsage.findUnique({
      where: {
        userId_usageDate: {
          userId,
          usageDate: today,
        },
      },
    });
  }

 
  upsertUsage(userId: string, today: Date) {
    return this.prismaService.aiPracticeUsage.upsert({
      where: {
        userId_usageDate: {
          userId,
          usageDate: today,
        },
      },
      create: {
        userId,
        usageDate: today,
        count: 1,
      },
      update: {
        count: { increment: 1 },
      },
    });
  }

  async getUsageCount(userId: string, today: Date): Promise<number> {
    const record = await this.getTodayUsage(userId, today);
    return record?.count ?? 0;
  }
}

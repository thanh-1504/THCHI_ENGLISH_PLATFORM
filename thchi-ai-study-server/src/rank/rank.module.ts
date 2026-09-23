import { Module } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { RankController } from './rank.controller';
import { RankService } from './rank.service';
import { RankRepo } from './repo/rank.repo';

@Module({
  controllers: [RankController],
  providers: [RankService, RankRepo, PrismaService],
  exports: [RankService],
})
export class RankModule {}

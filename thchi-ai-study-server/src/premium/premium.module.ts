import { Module } from '@nestjs/common';
import { PremiumController } from './premium.controller';
import { PremiumService } from './premium.service';
import { PremiumRepo } from './repos/premium.repo';

@Module({
  controllers: [PremiumController],
  providers: [PremiumService, PremiumRepo],
  exports: [PremiumRepo],
})
export class PremiumModule {}

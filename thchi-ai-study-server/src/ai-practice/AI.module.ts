import { Module } from '@nestjs/common';
import { NoteBookRepo } from 'src/notebook/repos/notebook.repo';
import { PremiumRepo } from 'src/premium/repos/premium.repo';
import { AIController } from './AI.controller';
import { AIRepo } from './AI.repo';
import { AIService } from './AI.service';

@Module({
  imports: [],
  controllers: [AIController],
  providers: [AIService, AIRepo, PremiumRepo, NoteBookRepo],
})
export class AIModule {}

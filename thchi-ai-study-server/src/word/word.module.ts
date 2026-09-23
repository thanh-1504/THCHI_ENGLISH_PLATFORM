import { Module } from '@nestjs/common';
import { WordRepo } from './repos/word.repo';
import { WordController } from './word.controller';
import { WordService } from './word.service';

@Module({
  controllers: [WordController],
  providers: [WordService, WordRepo],
  exports: [WordRepo],
})
export class WordModule {}

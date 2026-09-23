import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { FileService } from 'src/shared/services/file.service';
import { WordRepo } from 'src/word/repos/word.repo';
import { TopicWordRepo } from './repos/topic-word.repo';
import { TopicWordController } from './topic-word.controller';
import { TopicWordService } from './topic-word.service';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 1024 * 1024 * 5,
      },
    }),
  ],
  controllers: [TopicWordController],
  providers: [TopicWordService, TopicWordRepo, WordRepo, FileService],
})
export class TopicWordModule {}

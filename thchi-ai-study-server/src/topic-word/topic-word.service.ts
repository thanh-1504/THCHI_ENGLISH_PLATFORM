import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Word } from 'generated/prisma/client';
import { FileCsvType } from 'src/shared/schemas/file.schema';
import { FileService } from 'src/shared/services/file.service';
import { WordRepo } from 'src/word/repos/word.repo';
import { CreateTopicWordType } from './dto/create-topic-word.dto';
import { UpdateTopicWordType } from './dto/update-topic-word.dto';
import { TopicWordRepo } from './repos/topic-word.repo';
import { TopicIncludeWordSchema } from './schemas/topic-word.schema';

@Injectable()
export class TopicWordService {
  constructor(
    private readonly topicWordRepo: TopicWordRepo,
    private readonly fileService: FileService,
    private readonly wordRepo: WordRepo,
  ) {}

  async create(topicId: string, createTopicWordDto: CreateTopicWordType) {
    const term = createTopicWordDto.term;
    const wordType = createTopicWordDto.definitions?.[0]?.wordType;
    if (term && wordType) {
      const isDuplicate = await this.topicWordRepo.checkWordExistInTopic(
        topicId,
        term,
        wordType,
      );

      if (isDuplicate) {
        throw new ConflictException(
          `Từ vựng "${term}" với từ loại "${wordType}" đã tồn tại trong bài học này`,
        );
      }
    }
    return await this.topicWordRepo.create(topicId, createTopicWordDto);
  }

  async findTopicWordsAdmin(topicId: string) {
    const result = await this.topicWordRepo.findTopicWordsAdmin(topicId);
    if (!result || result.length === 0) return null;
    return {
      id: result[0].id,
      topicId: result[0].topicId,
      words: result.map((item) => ({
        id: item.word.id,
        term: item.word.term,
        phonetic: item.word.phonetic,
        imageUrl: item.imageUrl,
        audioUrl: item.word.audioUrl,
        definitions: item.word.definitions,
        examples: item.word.examples,
      })),
    };
  }

  async handleImportFileCSV(topicId: string, file: Express.Multer.File) {
    const rows = this.fileService.parseCsv(file.buffer);
    const errors: any[] = [];
    let successCount = 0;
    for (const [index, row] of rows.data.entries()) {
      const isValid = this.fileService.validateRow(row as FileCsvType);
      if (!isValid) {
        errors.push({
          row: index + 1,
          word: (row as any).term,
          message: 'Từ không hợp lệ',
        });
        continue;
      }
      const validRow: FileCsvType = row as FileCsvType;
      try {
        let word: Word | null = await this.wordRepo.findByTerm(validRow.term);
        if (!word) {
          await this.topicWordRepo.create(topicId, {
            term: validRow.term,
            phonetic: validRow.phonetic ?? null,
            audioUrl: validRow.audioUrl ?? null,
            definitions: [
              {
                wordType: validRow.wordType,
                meaning: validRow.meaning,
              },
            ],
            examples: [
              {
                sentence: validRow.sentence ?? '',
                translation: validRow.translation,
                isAiGenerated: false,
              },
            ],
            orderIndex: index,
            imageUrl: validRow.imageUrl ?? '',
          });
          successCount++;
        }
      } catch (error) {
        console.log(error);
        errors.push({
          row: index + 1,
          word: validRow.term,
          message: 'Có lỗi xảy ra',
        });
      }
    }
    if (successCount > 0)
      return {
        success: successCount,
        failed: errors.length,
        errors,
      };
    else throw new BadRequestException('File CSV rỗng hoặc không hợp lệ');
  }

  async findTopicIncludeWords(topicId: string) {
    const result = await this.topicWordRepo.findTopicIncludeWords(topicId);
    if (!result) throw new NotFoundException();
    const parsed = TopicIncludeWordSchema.safeParse(result);
    if (!parsed.success) {
      console.error(parsed.error);
    }
    return parsed.data;
  }

  async findOne(topicId: string, wordId: string) {
    return await this.topicWordRepo.findOne(topicId, wordId);
  }

  async update(topicId: string, wordId: string, payload: UpdateTopicWordType) {
    const term = payload.term;
    const wordType = payload.definitions?.[0]?.wordType;

    if (term && wordType) {
      const isDuplicate = await this.topicWordRepo.checkWordExistInTopic(
        topicId,
        term,
        wordType,
        wordId,
      );

      if (isDuplicate) {
        throw new ConflictException(
          `Từ vựng "${term}" với từ loại "${wordType}" đã tồn tại trong bài học này!`,
        );
      }
    }
    return this.topicWordRepo.update(topicId, wordId, payload);
  }

  async remove(topicId: string, wordId: string) {
    return this.topicWordRepo.remove(topicId, wordId);
  }
}

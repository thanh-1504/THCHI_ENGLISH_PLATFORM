import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { WordRepo } from 'src/word/repos/word.repo';
import { CreateTopicWordType } from '../dto/create-topic-word.dto';
import { UpdateTopicWordType } from '../dto/update-topic-word.dto';

@Injectable()
export class TopicWordRepo {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly wordRepo: WordRepo,
  ) {}

  async checkWordExistInTopic(
    topicId: string,
    term: string,
    wordType: string,
    excludeWordId?: string,
  ) {
    const whereClause: any = {
      topicId,
      word: {
        term: term.trim(),
        definitions: {
          some: {
            wordType: wordType,
          },
        },
      },
    };

    if (excludeWordId) {
      whereClause.wordId = { not: excludeWordId };
    }

    const existing = await this.prismaService.topicWord.findFirst({
      where: whereClause,
    });
    return !!existing;
  }

  create(topicId: string, payload: CreateTopicWordType) {
    const { orderIndex, imageUrl } = payload;
    return this.prismaService.$transaction(async (tx) => {
      const word = await this.wordRepo.createWordWithDefinitionsAndExamples(
        tx,
        payload,
      );
      const topicWord = await tx.topicWord.create({
        data: {
          wordId: word.id,
          topicId,
          orderIndex,
          imageUrl,
        },
      });
      return { ...topicWord, word };
    });
  }

  findTopicIncludeWords(topicId: string) {
    return this.prismaService.topicWord.findMany({
      where: { topicId, topic: { isPublished: true } },
      select: {
        id: true,
        topicId: true,
        imageUrl: true,
        word: {
          select: {
            id: true,
            term: true,
            phonetic: true,
            audioUrl: true,
            definitions: {
              select: {
                id: true,
                wordType: true,
                meaning: true,
              },
            },
            examples: {
              select: {
                id: true,
                sentence: true,
                translation: true,
                isAiGenerated: true,
              },
            },
          },
        },
      },
      orderBy: {
        orderIndex: 'asc',
      },
    });
  }

  findTopicWordsAdmin(topicId: string) {
    return this.prismaService.topicWord.findMany({
      where: { topicId },
      select: {
        id: true,
        topicId: true,
        imageUrl: true,
        word: {
          select: {
            id: true,
            term: true,
            phonetic: true,
            audioUrl: true,
            definitions: {
              select: {
                id: true,
                wordType: true,
                meaning: true,
              },
            },
            examples: {
              select: {
                id: true,
                sentence: true,
                translation: true,
                isAiGenerated: true,
              },
            },
          },
        },
      },
      orderBy: {
        orderIndex: 'asc',
      },
    });
  }

  findOne(topicId: string, wordId: string) {
    return this.prismaService.topicWord.findUnique({
      where: {
        topicId_wordId: {
          topicId,
          wordId,
        },
      },
      include: {
        word: {
          include: {
            definitions: true,
            examples: true,
          },
        },
      },
    });
  }

  update(topicId: string, wordId: string, payload: UpdateTopicWordType) {
    const {
      term,
      phonetic,
      audioUrl,
      definitions,
      examples,
      orderIndex,
      imageUrl,
    } = payload;
    return this.prismaService.$transaction(async (tx) => {
      // Update TopicWord
      if (orderIndex !== undefined || imageUrl !== undefined) {
        await tx.topicWord.update({
          where: { topicId_wordId: { topicId, wordId } },
          data: { orderIndex, imageUrl },
        });
      }
      // Update Word
      await tx.word.update({
        where: { id: wordId },
        data: {
          term,
          phonetic,
          audioUrl,
        },
      });
      // Update Definitions
      if (definitions && definitions.length > 0) {
        await tx.wordDefinition.deleteMany({ where: { wordId } });
        await tx.wordDefinition.createMany({
          data: definitions.map((def) => ({ ...def, wordId })),
        });
      }
      // Update Examples
      if (examples && examples.length > 0) {
        await tx.wordExample.deleteMany({ where: { wordId } });
        await tx.wordExample.createMany({
          data: examples.map((example) => ({ ...example, wordId })),
        });
      }
      // Fetch updated word
      return await tx.topicWord.findUnique({
        where: { topicId_wordId: { topicId, wordId } },
        include: {
          word: {
            include: {
              definitions: true,
              examples: true,
            },
          },
        },
      });
    });
  }

  remove(topicId: string, wordId: string) {
    return this.prismaService.$transaction(async (tx) => {
      await tx.wordExample.deleteMany({ where: { wordId } });
      await tx.wordDefinition.deleteMany({ where: { wordId } });
      await tx.topicWord.delete({
        where: {
          topicId_wordId: {
            topicId,
            wordId,
          },
        },
      });
    });
  }
}

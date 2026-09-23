import { Injectable } from '@nestjs/common';
import { WordStatus } from 'generated/prisma/enums';
import { PrismaService } from 'src/shared/services/prisma.service';
import { CreateNoteBookType } from '../schemas/notebook.schema';

@Injectable()
export class NoteBookRepo {
  constructor(private readonly prisma: PrismaService) {}

  getRandomWordsForAI(userId: string) {
    return this.prisma.notebookEntry.findMany({
      where: {
        notebook: { userId },
      },
      include: {
        word: {
          select: {
            term: true,
          },
        },
      },
    });
  }

  getWordsByStatus({
    notebookId,
    status,
  }: {
    notebookId: string;
    status: WordStatus;
  }) {
    return this.prisma.notebookEntry.findMany({
      where: {
        status,
        notebookId,
      },
      include: {
        word: {
          select: {
            id: true,
            term: true,
            phonetic: true,
            definitions: {
              select: {
                wordType: true,
                meaning: true,
              },
            },
          },
        },
      },
    });
  }

  getWordsDue(userId: string) {
    return this.prisma.notebookEntry.findMany({
      where: {
        notebook: { userId },
        status: WordStatus.ACTIVE,
        nextReviewAt: {
          lte: new Date(),
        },
      },
      include: {
        word: {
          select: {
            id: true,
            term: true,
            phonetic: true,
            audioUrl: true,
            definitions: {
              select: {
                wordType: true,
                meaning: true,
              },
            },
            examples: {
              select: {
                sentence: true,
                translation: true,
              },
            },
          },
        },
      },
      orderBy: {
        nextReviewAt: 'asc',
      },
    });
  }

  findEarliestActiveInRange(userId: string, from: Date, to: Date) {
    return this.prisma.notebookEntry.findFirst({
      where: {
        notebook: { userId },
        status: WordStatus.ACTIVE,
        nextReviewAt: { gt: from, lte: to },
      },
      orderBy: { nextReviewAt: 'asc' },
      select: { nextReviewAt: true },
    });
  }

  countActiveInRange(userId: string, from: Date, to: Date) {
    return this.prisma.notebookEntry.count({
      where: {
        notebook: { userId },
        status: WordStatus.ACTIVE,
        nextReviewAt: { gt: from, lte: to },
      },
    });
  }

  findOne(userId: string) {
    return this.prisma.notebook.findUnique({
      where: { userId },
    });
  }

  findWordInNoteBook(userId: string, term: string) {
    return this.prisma.notebookEntry.findFirst({
      where: {
        notebook: { userId },
        word: {
          term: { equals: term, mode: 'insensitive' },
        },
      },
      include: {
        word: {
          select: {
            id: true,
            term: true,
            phonetic: true,
            definitions: {
              select: { wordType: true, meaning: true },
            },
          },
        },
      },
    });
  }

  countWordsActive(notebookId: string) {
    return this.prisma.notebookEntry.count({
      where: { notebookId, status: WordStatus.ACTIVE },
    });
  }

  // countWordsSavedSince(notebookId: string, since: Date) {
  //   return this.prisma.notebookEntry.count({
  //     where: { notebookId, savedAt: { gte: since } },
  //   });
  // }

  countWordsSleeping(notebookId: string) {
    return this.prisma.notebookEntry.count({
      where: { notebookId, status: WordStatus.SLEEPING },
    });
  }

  createNoteBook(userId: string, payload: CreateNoteBookType) {
    return this.prisma.notebook.create({
      data: {
        userId,
        ...payload,
      },
    });
  }

  updateNotebookEntry({
    noteBookId,
    payload,
  }: {
    noteBookId: string;
    payload: { status: WordStatus; wordIds: string[] };
  }) {
    return this.prisma.notebookEntry.updateMany({
      where: {
        notebookId: noteBookId,
        wordId: {
          in: payload.wordIds,
        },
      },
      data: {
        status: payload.status,
      },
    });
  }

  deleteWordInNoteBook(notebookId: string, wordId: string) {
    return this.prisma.notebookEntry.delete({
      where: {
        notebookId_wordId: {
          notebookId,
          wordId,
        },
      },
    });
  }

  // Lấy danh sách users có từ đến hạn ôn tập, kèm email và số lượng từ
  async findUsersWithWordsDue(): Promise<{ email: string; wordCount: number }[]> {
    const now = new Date();
    const groups = await this.prisma.notebookEntry.groupBy({
      by: ['notebookId'],
      where: {
        status: WordStatus.ACTIVE,
        nextReviewAt: { lte: now },
      },
      _count: { notebookId: true },
    });

    if (groups.length === 0) return [];

    const notebookIds = groups.map((g) => g.notebookId);
    const notebooks = await this.prisma.notebook.findMany({
      where: { id: { in: notebookIds } },
      select: {
        id: true,
        user: { select: { email: true } },
      },
    });

    return notebooks.map((nb) => ({
      email: nb.user.email,
      wordCount:
        groups.find((g) => g.notebookId === nb.id)?._count.notebookId ?? 0,
    }));
  }

  async getWordCountByLevel(userId: string) {
    const notebook = await this.findOne(userId);
    if (!notebook) return [];
    return this.prisma.notebookEntry.groupBy({
      by: ['level'],
      where: { notebookId: notebook.id },
      _count: { level: true },
    });
  }

  async saveWordsToNotebook(userId: string, wordIds: string[]) {
    return this.prisma.$transaction(async (tx) => {
      let notebook = await tx.notebook.findUnique({ where: { userId } });
      if (!notebook) {
        notebook = await tx.notebook.create({ data: { userId } });
      }

      const now = new Date();
      for (const wordId of wordIds) {
        await tx.notebookEntry.upsert({
          where: {
            notebookId_wordId: { notebookId: notebook.id, wordId },
          },
          create: {
            notebookId: notebook.id,
            wordId,
            nextReviewAt: new Date(now.getTime() + 60 * 60 * 1000),
            intervalDays: 1,
            easeFactor: 2.5,
            reviewCount: 0,
          },
          update: {},
        });
      }
      const totalWordsInNotebookEntry = await tx.notebookEntry.count({
        where: { notebookId: notebook.id },
      });
      await tx.notebook.update({
        where: {
          userId,
        },
        data: {
          totalWordsSaved: totalWordsInNotebookEntry,
        },
      });

      return { saved: wordIds.length };
    });
  }
}

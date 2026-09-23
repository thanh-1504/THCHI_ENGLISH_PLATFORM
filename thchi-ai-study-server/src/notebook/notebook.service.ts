import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WordStatus } from 'generated/prisma/enums';
import { MailService } from 'src/shared/services/mail.service';
import { StreakService } from 'src/shared/services/streak.service';
import { NoteBookRepo } from './repos/notebook.repo';
import { CreateNoteBookType } from './schemas/notebook.schema';

@Injectable()
export class NotebookService {
  constructor(
    private readonly noteBookRepo: NoteBookRepo,
    private readonly streakService: StreakService,
    private readonly mailService: MailService,
  ) {}

  async findWordInNoteBook(userId: string, word: string) {
    const noteBook = await this.noteBookRepo.findOne(userId);
    if (!noteBook) throw new NotFoundException('Notebook của bạn chưa tồn tại');
    const entry = await this.noteBookRepo.findWordInNoteBook(userId, word);
    if (!entry)
      throw new NotFoundException(`Không tìm thấy từ "${word}" trong notebook`);

    return { word: entry.word, status: entry.status };
  }

  async getWordsByStatus({
    userId,
    payload,
  }: {
    userId: string;
    payload: { status: WordStatus };
  }) {
    const noteBook = await this.noteBookRepo.findOne(userId);
    if (!noteBook) throw new NotFoundException('Notebook của bạn chưa tồn tại');
    const result = await this.noteBookRepo.getWordsByStatus({
      notebookId: noteBook.id,
      status: payload.status,
    });
    return result.map((item) => ({
      ...item.word,
      level: item.level,
      status: item.status,
    }));
  }

  async getRandomWordsForAI(userId: string) {
    const result = await this.noteBookRepo.getRandomWordsForAI(userId);
    if (result.length === 0) return [];
    const random = [...result].sort(() => 0.5 - Math.random());
    const selected = random.slice(0, 10);
    return selected.map((item) => item.word.term);
  }

  async getNoteBookByUserId(userId: string) {
    const noteBook = await this.noteBookRepo.findOne(userId);
    if (!noteBook) return null;
    const [totalWordsSleeping, totalWordsActive] = await Promise.all([
      this.noteBookRepo.countWordsSleeping(noteBook.id),
      this.noteBookRepo.countWordsActive(noteBook.id),
    ]);
    return {
      ...noteBook,
      totalWordsActive,
      totalWordsSleeping,
    };
  }

  async getStats(userId: string) {
    const [noteBook, streak] = await Promise.all([
      this.getNoteBookByUserId(userId),
      this.streakService.getUserStreak(userId),
    ]);
    const totalWords =
      (noteBook?.totalWordsActive ?? 0) + (noteBook?.totalWordsSleeping ?? 0);

    // let wordsLearnedThisWeek = 0;
    // if (noteBook?.id) {
    //   const oneWeekAgo = new Date();
    //   oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    //   wordsLearnedThisWeek = await this.noteBookRepo.countWordsSavedSince(
    //     noteBook.id,
    //     oneWeekAgo,
    //   );
    // }

    return {
      totalWords,
      // wordsLearnedThisWeek,
      currentStreak: streak?.currentStreak ?? 0,
      longestStreak: streak?.longestStreak ?? 0,
    };
  }

  async getWordCountByLevel(userId: string) {
    const rows = await this.noteBookRepo.getWordCountByLevel(userId);
    const map: Record<string, number> = {};
    for (const row of rows) {
      map[row.level] = row._count.level;
    }
    return map;
  }

  async getWordsDue(userId: string) {
    const words = await this.noteBookRepo.getWordsDue(userId);
    return words.map((word) => ({
      id: word.word.id,
      notebookEntryId: word.id,
      level: word.level,
      status: word.status,
      term: word.word.term,
      phonetic: word.word.phonetic,
      audioUrl: word.word.audioUrl,
      definitions: word.word.definitions,
      examples: word.word.examples,
    }));
  }

  async getNextReviewAt(userId: string) {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const entry = await this.noteBookRepo.findEarliestActiveInRange(
      userId,
      now,
      endOfDay,
    );
    if (!entry) return { nextReviewAt: null, upcomingCount: 0 };

    const upcomingCount = await this.noteBookRepo.countActiveInRange(
      userId,
      now,
      endOfDay,
    );

    return { nextReviewAt: entry.nextReviewAt, upcomingCount };
  }

  async createNoteBook(userId: string, createNoteBookDto: CreateNoteBookType) {
    const noteBook = await this.noteBookRepo.findOne(userId);
    if (noteBook) {
      throw new BadRequestException('Sổ tay đã tồn tại');
    }
    return this.noteBookRepo.createNoteBook(userId, createNoteBookDto);
  }

  async updateNotebookEntry({
    userId,
    payload,
  }: {
    userId: string;
    payload: { status: WordStatus; wordIds: string[] };
  }) {
    const noteBook = await this.noteBookRepo.findOne(userId);
    if (!noteBook) {
      throw new NotFoundException('Sổ tay chưa tồn tại');
    }
    return await this.noteBookRepo.updateNotebookEntry({
      noteBookId: noteBook.id,
      payload,
    });
  }

  async deleteWordInNoteBook(userId: string, wordId: string) {
    const noteBook = await this.noteBookRepo.findOne(userId);
    if (!noteBook) throw new NotFoundException('Notebook không tồn tại');
    return await this.noteBookRepo.deleteWordInNoteBook(noteBook.id, wordId);
  }

  async saveWordsToNotebook(userId: string, wordIds: string[]) {
    if (!wordIds.length) return { saved: 0 };
    return this.noteBookRepo.saveWordsToNotebook(userId, wordIds);
  }

  @Cron(CronExpression.EVERY_HOUR)
  async sendReviewReminderEmails() {
    const users = await this.noteBookRepo.findUsersWithWordsDue();

    await Promise.allSettled(
      users.map(({ email, wordCount }) =>
        this.mailService.sendReviewNotification(email, wordCount),
      ),
    );
  }
}

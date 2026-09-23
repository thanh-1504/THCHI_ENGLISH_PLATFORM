import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { WordStatus } from 'generated/prisma/enums';
import { User } from 'src/shared/decorators/user.decorator';
import { MailService } from 'src/shared/services/mail.service';
import { CreateNoteBookDTO } from './dto/create-notebook.dto';
import { NotebookService } from './notebook.service';

@Controller('notebook')
export class NotebookController {
  constructor(
    private readonly notebookService: NotebookService,
  ) {}

  @Get()
  getNoteBook(@User('id') userId: string) {
    return this.notebookService.getNoteBookByUserId(userId);
  }

  @Get('/stats')
  getStats(@User('id') userId: string) {
    return this.notebookService.getStats(userId);
  }

  @Get('/word-status/:status')
  getWordsByStatus(
    @User('id') userId: string,
    @Param('status') status: string,
  ) {
    return this.notebookService.getWordsByStatus({
      userId,
      payload: { status: status as WordStatus },
    });
  }

  @Get('/random-words')
  getRandomWordsForAI(@User('id') userId: string) {
    return this.notebookService.getRandomWordsForAI(userId);
  }

  @Get('/search')
  findWordInNoteBook(@User('id') userId: string, @Query('word') word: string) {
    return this.notebookService.findWordInNoteBook(userId, word);
  }

  @Get('/words-due')
  getWordsDue(@User('id') userId: string) {
    return this.notebookService.getWordsDue(userId);
  }

  @Get('/next-review-at')
  getNextReviewAt(@User('id') userId: string) {
    return this.notebookService.getNextReviewAt(userId);
  }

  @Get('/level-stats')
  getWordCountByLevel(@User('id') userId: string) {
    return this.notebookService.getWordCountByLevel(userId);
  }

  @Post('')
  createNoteBook(
    @User('id') userId: string,
    createNoteBookDto: CreateNoteBookDTO,
  ) {
    return this.notebookService.createNoteBook(userId, createNoteBookDto);
  }

  @Post('/entries')
  saveEntries(@User('id') userId: string, @Body() body: { wordIds: string[] }) {
    return this.notebookService.saveWordsToNotebook(userId, body.wordIds ?? []);
  }

  @Post('/entries/update')
  updateNotebookEntry(
    @User('id') userId: string,
    @Body() payload: { status: WordStatus; wordIds: string[] },
  ) {
    return this.notebookService.updateNotebookEntry({
      userId,
      payload,
    });
  }

  @Delete('/entries/:wordId')
  deleteWordInNoteBook(
    @User('id') userId: string,
    @Param('wordId') wordId: string,
  ) {
    return this.notebookService.deleteWordInNoteBook(userId, wordId);
  }
}

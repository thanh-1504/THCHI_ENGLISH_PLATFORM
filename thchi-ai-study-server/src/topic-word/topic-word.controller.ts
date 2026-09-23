import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidationPipe } from 'src/shared/configs/file.validation';
import { CreateTopicWordDTO } from './dto/create-topic-word.dto';
import { UpdateTopicWordDto } from './dto/update-topic-word.dto';
import { TopicWordService } from './topic-word.service';

@Controller('topic-word')
export class TopicWordController {
  constructor(private readonly topicWordService: TopicWordService) {}

  @Get(':topicId')
  findTopicIncludeWords(@Param('topicId') topicId: string) {
    return this.topicWordService.findTopicIncludeWords(topicId);
  }

  @Get(':topicId/admin')
  findTopicWordsAdmin(@Param('topicId') topicId: string) {
    return this.topicWordService.findTopicWordsAdmin(topicId);
  }

  @Get(':topicId/words/:wordId')
  findWordInTopic(
    @Param('topicId') topicId: string,
    @Param('wordId') wordId: string,
  ) {
    return this.topicWordService.findOne(topicId, wordId);
  }

  @Post('/:topicId/words')
  create(
    @Param('topicId') topicId: string,
    @Body() createTopicWordDto: CreateTopicWordDTO,
  ) {
    return this.topicWordService.create(topicId, createTopicWordDto);
  }

  @Post('/:topicId/words/import')
  @UseInterceptors(FileInterceptor('file'))
  createTopicWithFileCSV(
    @Param('topicId') topicId: string,
    @UploadedFile(new FileValidationPipe()) file: Express.Multer.File,
  ) {
    return this.topicWordService.handleImportFileCSV(topicId, file);
  }

  @Patch(':topicId/words/:wordId')
  update(
    @Param('topicId') topicId: string,
    @Param('wordId') wordId: string,
    @Body() updateTopicWordDto: UpdateTopicWordDto,
  ) {
    return this.topicWordService.update(topicId, wordId, updateTopicWordDto);
  }

  @Delete(':topicId/words/:wordId')
  remove(@Param('topicId') topicId: string, @Param('wordId') wordId: string) {
    return this.topicWordService.remove(topicId, wordId);
  }
}

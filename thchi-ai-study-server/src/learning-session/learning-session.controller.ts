import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { User } from 'src/shared/decorators/user.decorator';
import { CreateLearningLogDTO } from './dto/create-learning-session.dto';
import { CompleteLearningSessionDTO } from './dto/update-learning-session.dto';
import { LearningSessionService } from './learning-session.service';

@Controller('learning-session')
export class LearningSessionController {
  constructor(
    private readonly learningSessionService: LearningSessionService,
  ) {}

  @Post('/log')
  createLearningSessionLog(
    @User('id') userId: string,
    @Body() createLearningSessionDTO: CreateLearningLogDTO,
  ) {
    return this.learningSessionService.createLearningSessionLog(
      userId,
      createLearningSessionDTO,
    );
  }

  @Post('/check')
  checkAnswer(
    @Body()
    answerDTO: {
      wordId: string;
      answer: string;
    },
  ) {
    return this.learningSessionService.checkAnswer(answerDTO);
  }

  @Post('/:topicId')
  create(@Param('topicId') topicId: string, @User('id') userId: string) {
    return this.learningSessionService.create(userId, topicId);
  }

  @Post('/:id/complete')
  completeLearningSession(
    @Param('id') learningSessionId: string,
    @User('id') userId: string,
    @Body() completeLearningSessionDTO: CompleteLearningSessionDTO,
  ) {
    return this.learningSessionService.updateLearningSession({
      learningSessionId,
      userId,
      completeLearningSessionDTO,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.learningSessionService.findOne(id);
  }
}

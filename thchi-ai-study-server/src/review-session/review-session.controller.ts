import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { User } from 'src/shared/decorators/user.decorator';
import { CompleReviewSessionDTO } from './dtos/comple.review-session.dto';
import { CreateReviewSessionLogDTO } from './dtos/create.review-session.dto';
import { ReviewSessionService } from './review-session.service';

@Controller('review-session')
export class ReviewSessionController {
  constructor(private readonly reviewSessionService: ReviewSessionService) {}
  @Get('/:id')
  getReviewSessionById(@Param('id') id: string) {
    return this.reviewSessionService.getReviewSessionById(id);
  }

  @Post('')
  createReviewSession(@User('id') userId: string) {
    return this.reviewSessionService.createReviewSession(userId);
  }

  @Post('/:id/log')
  createReviewSessionLog(
    @User('id') userId: string,
    @Param('id') reviewSessionId: string,
    @Body() createReviewSessionLog: CreateReviewSessionLogDTO,
  ) {
    return this.reviewSessionService.createReviewSessionLog(
      userId,
      reviewSessionId,
      createReviewSessionLog,
    );
  }

  @Post('/:id/complete')
  completeReviewSession(
    @User('id') userId: string,
    @Param('id') sessionId: string,
    @Body() payload: CompleReviewSessionDTO,
  ) {
    return this.reviewSessionService.complete(userId, sessionId, payload);
  }
}

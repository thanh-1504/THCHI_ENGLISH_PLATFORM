import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AIService } from './AI.service';
import {
  GenerateSentenceDTO,
  GradeSpeakingDTO,
  GradeWritingDTO,
} from './dtos/AI.dto';
import { User } from 'src/shared/decorators/user.decorator';

@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('chat')
  async chatWithGermini(@Body() payload: { message: string; historyChat: [] }) {
    const reply = await this.aiService.chat(payload);
    return {
      success: true,
      reply,
    };
  }

  @Post('generate-sentence')
  generateSentence(@Body() payload: GenerateSentenceDTO, @User("id")userId:string) {
    return this.aiService.generateSentence(userId, payload);
  }

  @Post('generate-speaking-sentence')
  generateSpeakingSentence(@Body() payload: GenerateSentenceDTO, @User("id")userId:string) {
    return this.aiService.generateSpeakingSentence(userId, payload);
  }

  @Post('generate-sentence-notebook')
  generateSentenceFromNotebook(@Body() payload: GenerateSentenceDTO, @User("id") userId: string) {
    return this.aiService.generateSentenceFromNotebook(userId, payload);
  }

  @Post('generate-speaking-sentence-notebook')
  generateSpeakingSentenceFromNotebook(@Body() payload: GenerateSentenceDTO, @User("id") userId: string) {
    return this.aiService.generateSpeakingSentenceFromNotebook(userId, payload);
  }

  @Post('generate-quizlet')
  generateQuizlet(@Body() payload: { words: string[] }, @User("id")userId:string) {
    return this.aiService.generateQuizlet(userId, payload.words);
  }

  @Post('grade-writing')
  async gradeWriting(@Body() payload: GradeWritingDTO, @User('id') userId: string) {
    const result = await this.aiService.gradeWriting(payload, userId);
    return result;
  }

  @Post('grade-speaking')
  gradeSpeaking(@Body() payload: GradeSpeakingDTO, @User('id') userId: string) {
    return this.aiService.gradeSpeaking(payload, userId);
  }

  @Post('complete-quizlet')
  completeQuizlet(@User('id') userId: string) {
    return this.aiService.completeQuizlet(userId);
  }

  @Get('practice-usage')
  getPracticeUsage(@User("id")userId:string) {
    return this.aiService.getPracticeUsage(userId);
  }

  @Post('/topic/word/ai-generate')
  generateVocabAI(
    @Body() payload: { topic: string; level: string; quantity: number },
  ) {
    return this.aiService.generateVocabularyWithMedia(payload);
  }
}

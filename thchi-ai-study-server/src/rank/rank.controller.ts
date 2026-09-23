import { Body, Controller, Get, Post } from '@nestjs/common';
import { User } from 'src/shared/decorators/user.decorator';
import { RankService } from './rank.service';

@Controller('rank')
export class RankController {
  constructor(private readonly rankService: RankService) {}

  @Get('/leaderboard')
  getRankBoard(@User('id') userId: string) {
    return this.rankService.getRankBoard(userId);
  }

  @Post('/add-xp')
  addXp(@User('id') userId: string, @Body('xp') xp: number) {
    return this.rankService.addXp(userId, xp);
  }
}

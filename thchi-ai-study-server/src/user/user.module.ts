import { Module } from '@nestjs/common';
import { OauthRepo } from './repos/oauth.repo';
import { StreakGoalRepository } from './repos/streak-goal.repo';
import { UserRepository } from './repos/user.repo';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository, OauthRepo, StreakGoalRepository],
  exports: [UserRepository],
})
export class UserModule {}

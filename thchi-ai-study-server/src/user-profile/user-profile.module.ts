import { Module } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { UserProfileController } from './user-profile.controller';
import { UserProfileRepo } from './repos/user-profile.repo';
import { UserRepository } from 'src/user/repos/user.repo';

@Module({
  controllers: [UserProfileController],
  providers: [UserProfileService, UserProfileRepo,UserRepository],
})
export class UserProfileModule {}

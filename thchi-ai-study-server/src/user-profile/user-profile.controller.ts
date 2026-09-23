import { Body, Controller, Get, Patch } from '@nestjs/common';
import { User } from 'src/shared/decorators/user.decorator';
import { ChangePasswordUserDTO } from './dto/change-password.dto';
import { UpdateUserProfileDTO } from './dto/update-user-profile.dto';
import { UserProfileService } from './user-profile.service';

@Controller('user-profile')
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Get()
  getUserProfile(@User('id') userId: string) {
    return this.userProfileService.getUserProfile(userId);
  }

  @Get('/streak')
  getUserProfileStreak(@User('id') userId: string) {
    return this.userProfileService.getUserProfileStreak(userId);
  }

  @Patch()
  updateUserProfile(
    @User('id') userId: string,
    @Body() updateUserProfileDto: UpdateUserProfileDTO,
  ) {
    return this.userProfileService.updateUserProfile(
      userId,
      updateUserProfileDto,
    );
  }

  @Patch('/change-password')
  changePassword(
    @User('id') userId: string,
    @Body() changePasswordUserDTO: ChangePasswordUserDTO,
  ) {
    return this.userProfileService.changePassword(
      userId,
      changePasswordUserDTO,
    );
  }
}

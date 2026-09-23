import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { differenceInCalendarDays } from 'date-fns';
import { HashingService } from 'src/shared/services/hashing.service';
import { UserRepository } from 'src/user/repos/user.repo';
import { UserProfileRepo } from './repos/user-profile.repo';
import {
  ChangePasswordUserType,
  UpdateUserProfileType,
  UserProfileResponseSchema,
} from './schemas/user-profile.schema';
@Injectable()
export class UserProfileService {
  constructor(
    private readonly userProfileRepo: UserProfileRepo,
    private readonly userRepo: UserRepository,
    private readonly hashingService: HashingService,
  ) {}
  async getUserProfile(userId: string) {
    const userProfile = await this.userProfileRepo.getUserProfile(userId);
    if (!userProfile) {
      throw new NotFoundException('Không tìm thấy hồ sơ người dùng này');
    }
    const parsed = UserProfileResponseSchema.safeParse(userProfile);
    if (!parsed.success) throw new BadRequestException();
    return parsed.data;
  }

  async getUserProfileStreak(userId: string) {
    const streakUser = await this.userProfileRepo.getUserProfileStreak(userId);
    if (!streakUser) throw new BadRequestException('Bạn chưa có chuỗi học tập');
    if (!streakUser.lastStudiedDate) {
      return {
        currentStreak: 0,
        longestStreak: streakUser.longestStreak,
        streakShieldCount: streakUser.streakShieldCount,
      };
    }
    const diffDays = differenceInCalendarDays(
      new Date(),
      streakUser.lastStudiedDate,
    );
    const missedDays = diffDays - 1;
    if (missedDays >= 1) {
      if (streakUser.streakShieldCount < missedDays) {
        return {
          currentStreak: 0,
          longestStreak: Math.max(
            streakUser.currentStreak,
            streakUser.longestStreak,
          ),
        };
      }
    }
    return {
      currentStreak:
        missedDays >= 1 && streakUser.streakShieldCount < missedDays
          ? 0
          : streakUser.currentStreak,
      longestStreak: streakUser.longestStreak,
      lastStudiedDate: streakUser.lastStudiedDate,
      streakShieldCount: streakUser.streakShieldCount,
    };
  }

  async updateUserProfile(
    userId: string,
    updateUserProfileDto: UpdateUserProfileType,
  ) {
    const userProfile = await this.userProfileRepo.getUserProfile(userId);
    if (!userProfile)
      throw new NotFoundException('Không tìm thấy hồ sơ người dùng này');
    return await this.userProfileRepo.updateUserProfile(
      userId,
      updateUserProfileDto,
    );
  }

  async changePassword(
    userId: string,
    changePasswordUserDto: ChangePasswordUserType,
  ) {
    const user = await this.userRepo.findUserByIdOrEmail({ id: userId });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng này');
    const correctPass = await this.hashingService.comparePassword(
      changePasswordUserDto.currentPassword,
      user.password as string,
    );
    if (!correctPass)
      throw new BadRequestException('Mật khẩu hiện tại không đúng');
    const hashedPassword = await this.hashingService.hashPassword(
      changePasswordUserDto.newPassword,
    );
    return await this.userRepo.updateUser(
      {
        id: userId,
      },
      { password: hashedPassword },
    );
  }
}

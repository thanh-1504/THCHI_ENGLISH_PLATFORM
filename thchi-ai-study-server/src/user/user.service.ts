import { BadRequestException, Injectable } from '@nestjs/common';
import { HashingService } from 'src/shared/services/hashing.service';
import { StreakService } from 'src/shared/services/streak.service';
import { UpdateUserDTO } from './dto/update.user.dto';
import { StreakGoalRepository } from './repos/streak-goal.repo';
import { UserRepository } from './repos/user.repo';
import { ChangePasswordType } from './schemas/change.password.schema';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly streakService: StreakService,
    private readonly hashingService: HashingService,
    private readonly streakGoalRepo: StreakGoalRepository,
  ) {}
  async getMyStreak(userId: string) {
    return this.streakService.getUserStreak(userId);
  }

  async getMyStreakGoalStatus(userId: string) {
    const inProgressGoal =
      await this.streakGoalRepo.findInProgressGoalByUserId(userId);
    return { hasInProgressGoal: inProgressGoal !== null };
  }

  async getStreakGoalConfigs() {
    return this.streakGoalRepo.findAllActiveConfigs();
  }

  async createStreakGoal(userId: string, configId: string) {
    return this.streakGoalRepo.createGoal(userId, configId);
  }

  async update({ id, payload }: { id: string; payload: UpdateUserDTO }) {
    const user = await this.userRepo.findUserByIdOrEmail({ id });
    if (!user) throw new BadRequestException('Không tìm thấy người dùng');
    return await this.userRepo.updateUser({ id: user.id }, payload);
  }

  async changePassword(userId: string, payload: ChangePasswordType) {
    const user = await this.userRepo.findUserByIdOrEmail({ id: userId });
    if (!user) throw new BadRequestException('Không tìm thấy người dùng');

    const hashed = await this.hashingService.hashPassword(payload.newPassword);
    await this.userRepo.updateUser({ id: userId }, { password: hashed });
    return { message: 'Đổi mật khẩu thành công' };
  }
  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}

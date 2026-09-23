import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { User } from 'src/shared/decorators/user.decorator';
import { ChangePasswordDTO } from './dto/change.password.dto';
import { CreateStreakGoalDTO } from './dto/create.streak-goal.dto';
import { UpdateUserDTO } from './dto/update.user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get("/my-streak")
  getMyStreak(@User('id') userId: string) {
    return this.userService.getMyStreak(userId);
  }

  @Get("/my-streak-goal-status")
  getMyStreakGoalStatus(@User('id') userId: string) {
    return this.userService.getMyStreakGoalStatus(userId);
  }

  @Get('/streak-goal-configs')
  getStreakGoalConfigs() {
    return this.userService.getStreakGoalConfigs();
  }

  @Post('/streak-goal')
  createStreakGoal(
    @User('id') userId: string,
    @Body() payload: CreateStreakGoalDTO,
  ) {
    return this.userService.createStreakGoal(userId, payload.configId);
  }

  @Patch()
  update(@User('id') userId: string, @Body() payload: UpdateUserDTO) {
    return this.userService.update({ id: userId, payload });
  }

  @Post('/change-password')
  changePassword(
    @User('id') userId: string,
    @Body() payload: ChangePasswordDTO,
  ) {
    return this.userService.changePassword(userId, payload);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userService.remove(+id);
  // }
}

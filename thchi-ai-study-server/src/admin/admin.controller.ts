import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { Role } from 'generated/prisma/enums';
import { Roles } from 'src/shared/decorators/role.decorator';
import { AdminService } from './admin.service';
import {
  CreateRankTierConfigDTO,
  CreateTopicAdminDTO,
  CreateUserAdminDTO,
  UpdateRankTierConfigDTO,
} from './dto/create-admin.dto';
import { PaginationPostAdminDTO } from './dto/pagination.post.admin.dto';
import { PaginationTransactionAdminDTO } from './dto/pagination.transaction.admin.dto';
import { PaginationUserAdminDTO } from './dto/pagination.user.admin';
import { UpdateStatusAccountDTO } from './dto/update-admin.dto';

@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('/users')
  getUsers(@Query() query: PaginationUserAdminDTO) {
    return this.adminService.getUsers(query);
  }

  @Post('/users')
  createUser(@Body() payload: CreateUserAdminDTO) {
    return this.adminService.createUser(payload);
  }

  @Get('/users/:id')
  getUserDetail(@Param('id') id: string) {
    return this.adminService.getUserDetail(id);
  }

  @Get('/dashboard/stats')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('/top-courses')
  getTopCourse() {
    return this.adminService.getTopCourse();
  }

  @Get('/transaction-latest')
  getLatestTransactions() {
    return this.adminService.getLatestTransactions();
  }

  @Get('/monthly-revenue')
  getMonthlyRevenue() {
    return this.adminService.getMonthlyRevenue();
  }

  @Get('/top-topics')
  getTopTopics() {
    return this.adminService.getTopTopics();
  }

  @Patch('users/:id/status')
  updateUserStatus(
    @Param('id') userId: string,
    @Body('status') status: UpdateStatusAccountDTO,
  ) {
    return this.adminService.updateUserStatus(userId, status);
  }

  // Transaction
  @Get('/transactions')
  getTransactions(@Query() query: PaginationTransactionAdminDTO) {
    return this.adminService.getTransactions(query);
  }

  @Get('/transactions/:id')
  getTransactionDetail(@Param('id') id: string) {
    return this.adminService.getTransactionDetail(id);
  }

  // Courses
  @Post('/course/:courseId/topic')
  @UseInterceptors()
  createTopic(
    @Param('courseId') courseId: string,
    @Body() payload: CreateTopicAdminDTO,
  ) {
    return this.adminService.createTopic({ courseId, payload });
  }

  @Post('/topic/:topicId/word')
  @UseInterceptors()
  createTopicWord(
    @Param('courseId') courseId: string,
    @Body() payload: CreateTopicAdminDTO,
  ) {
    return this.adminService.createTopic({ courseId, payload });
  }

  // Posts
  @Get('/posts')
  getPosts(@Query() query: PaginationPostAdminDTO) {
    return this.adminService.getPosts(query);
  }

  @Delete('/posts/:id')
  deletePost(@Param('id') id: string) {
    return this.adminService.deletePost(id);
  }

  @Patch('/posts/:id/status')
  updatePostStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.adminService.updatePostStatus(id, status);
  }

  // RankTierConfig
  @Get('/rank-tier-configs')
  getRankTierConfigs() {
    return this.adminService.getRankTierConfigs();
  }

  @Post('/rank-tier-configs')
  createRankTierConfig(@Body() payload: CreateRankTierConfigDTO) {
    return this.adminService.createRankTierConfig(payload);
  }

  @Patch('/rank-tier-configs/:id')
  updateRankTierConfig(
    @Param('id') id: string,
    @Body() payload: UpdateRankTierConfigDTO,
  ) {
    return this.adminService.updateRankTierConfig(id, payload);
  }

  @Delete('/rank-tier-configs/:id')
  deleteRankTierConfig(@Param('id') id: string) {
    return this.adminService.deleteRankTierConfig(id);
  }

  @Post('/seed-leaderboard')
  async seedLeaderboard() {
    return this.adminService.seedLeaderboardFromPostgres();
  }
}

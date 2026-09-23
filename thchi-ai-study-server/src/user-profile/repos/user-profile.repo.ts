import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { UpdateUserProfileType } from '../schemas/user-profile.schema';

@Injectable()
export class UserProfileRepo {
  constructor(private readonly prismaService: PrismaService) {}
  getUserProfile(userId: string) {
    return this.prismaService.userProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });
  }

  getUserProfileStreak(userId: string) {
    return this.prismaService.userStreak.findUnique({
      where: { userId },
    });
  }

  updateUserProfile(
    userId: string,
    updateUserProfileDto: UpdateUserProfileType,
  ) {
    return this.prismaService.userProfile.update({
      where: { userId },
      data: updateUserProfileDto,
    });
  }
}

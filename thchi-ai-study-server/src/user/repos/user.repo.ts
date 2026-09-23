import { Injectable } from '@nestjs/common';
import { AccountStatus, AuthProvider } from 'generated/prisma/enums';
import { RegisterDTO } from 'src/auth/dto/auth.dto';
import { GoogleUser } from 'src/shared/interfaces/IUser';
import { PrismaService } from 'src/shared/services/prisma.service';
import { UpdateUserType } from '../schemas/update.user.schema';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findAllUser() {
    return this.prismaService.user.findMany();
  }

  findUserByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: { email },
    });
  }

  getMe(email: string) {
    return this.prismaService.user.findUnique({
      where: { email },
      include: {
        profile: {
          select: {
            avatarUrl: true,
            avatarPublicId: true,
          },
        },
        subscription: {
          select: { isActive: true, endDate: true },
        },
      },
    });
  }

  findUserByIdOrEmail(payload: { id: string } | { email: string }) {
    return this.prismaService.user.findUnique({
      where: payload,
    });
  }

  registerUser(registerUserDto: RegisterDTO) {
    return this.prismaService.user.create({
      data: registerUserDto,
    });
  }

  createGoogleAccount(payload: GoogleUser) {
    return this.prismaService.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: payload.email,
          name: payload.name,
          password: null,
          status: AccountStatus.ACTIVE,
        },
      });
      await tx.userProfile.create({
        data: {
          userId: user.id,
          displayName: user.name,
          avatarUrl: payload.avatar ?? '',
        },
      });
      await tx.oAuthAccount.create({
        data: {
          userId: user.id,
          provider: AuthProvider.GOOGLE,
          providerUid: payload.googleId,
        },
      });
      return user;
    });
  }

  async updateUser(
    where: { id: string } | { email: string },
    payload: UpdateUserType,
  ) {
    const { avatarUrl, avatarPublicId, ...userFields } = payload;

    return this.prismaService.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { ...where, deletedAt: null },
      });
      if (!user) return null;

      if (avatarUrl !== undefined || avatarPublicId !== undefined) {
        await tx.userProfile.upsert({
          where: { userId: user.id },
          update: {
            ...(avatarUrl !== undefined && { avatarUrl }),
            ...(avatarPublicId !== undefined && { avatarPublicId }),
          },
          create: {
            userId: user.id,
            displayName: user.name,
            avatarUrl: avatarUrl ?? '',
            avatarPublicId: avatarPublicId ?? '',
          },
        });
      }

      if (Object.keys(userFields).length > 0) {
        return tx.user.update({
          where: { id: user.id, deletedAt: null },
          data: { ...userFields },
          omit: {
            password: true,
            createdAt: true,
            updatedAt: true,
            deletedAt: true,
          },
        });
      }

      return user;
    });
  }
}

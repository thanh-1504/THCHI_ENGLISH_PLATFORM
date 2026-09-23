import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import {
  CreateNotificationType,
  MarkAsReadType,
} from '../schemas/notification.schema';

@Injectable()
export class NotificationRepo {
  constructor(private prismaService: PrismaService) {}

  findOne(id: string) {
    return this.prismaService.notification.findUnique({
      where: { id },
    });
  }

  getNotifications(userId: string) {
    return this.prismaService.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  countUnread(userId: string) {
    return this.prismaService.notification.count({
      where: { userId, isRead: false },
    });
  }

  markAsRead(id: string, payload: MarkAsReadType) {
    return this.prismaService.notification.update({
      where: { id },
      data: {
        isRead: payload.isRead,
      },
    });
  }

  create(userId: string, payload: CreateNotificationType) {
    return this.prismaService.notification.create({
      data: {
        userId,
        message: '',
        ...payload,
      },
    });
  }

  deleteNotification(id: string) {
    return this.prismaService.notification.delete({
      where: { id },
    });
  }
}

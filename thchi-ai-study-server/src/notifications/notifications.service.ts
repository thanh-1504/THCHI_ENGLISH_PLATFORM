import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationRepo } from './repos/notification.repo';
import {
  CreateNotificationType,
  MarkAsReadType,
} from './schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(private readonly notificationRepo: NotificationRepo) {}
  async getNotifications(userId: string) {
    return await this.notificationRepo.getNotifications(userId);
  }

  async getUnreadCount(userId: string) {
    return await this.notificationRepo.countUnread(userId);
  }

  async markAsRead(id: string, userId: string, payload: MarkAsReadType) {
    const notification = await this.notificationRepo.findOne(id);
    if (!notification) {
      throw new NotFoundException('Không tìm thấy thông báo');
    }
    if (notification.userId !== userId) {
      throw new BadRequestException('Bạn không có quyền với thông báo này');
    }
    return await this.notificationRepo.markAsRead(id, payload);
  }

  async createNotification(userId: string, payload: CreateNotificationType) {
    return await this.notificationRepo.create(userId, payload);
  }

  async deleteNotification(id: string, userId: string) {
    const notification = await this.notificationRepo.findOne(id);
    if (!notification) {
      throw new NotFoundException('Không tìm thấy thông báo');
    }
    if (notification.userId !== userId) {
      throw new BadRequestException('Bạn không có quyền xóa thông báo này');
    }
    return await this.notificationRepo.deleteNotification(id);
  }
}

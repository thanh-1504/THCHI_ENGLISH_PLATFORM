import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { User } from 'src/shared/decorators/user.decorator';
import { MarkAsReadDTO } from './dtos/notification.dto';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}
  @Get()
  getNotifications(@User('id') userId: string) {
    return this.notificationsService.getNotifications(userId);
  }

  @Get('/unread-count')
  getUnreadCount(@User('id') userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Patch('/:id/read')
  markAsRead(
    @Param('id') id: string,
    @User('id') userId: string,
    @Body() markAsReadDTO: MarkAsReadDTO,
  ) {
    return this.notificationsService.markAsRead(id, userId, markAsReadDTO);
  }

  @Delete('/:id')
  deleteNotification(@Param('id') id: string, @User('id') userId: string) {
    return this.notificationsService.deleteNotification(id, userId);
  }
}

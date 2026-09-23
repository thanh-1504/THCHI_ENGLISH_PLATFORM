import { Module } from '@nestjs/common';
import { NotificationGateway } from 'src/websocket/notification.gateway';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationRepo } from './repos/notification.repo';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationRepo],
})
export class NotificationsModule {}

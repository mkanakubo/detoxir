import { Module } from '@nestjs/common';
import { EventNotificationWorkerService } from '../service/event-notification-worker.service';

@Module({
  providers: [EventNotificationWorkerService],
})
export class EventNotificationWorkerModule {}

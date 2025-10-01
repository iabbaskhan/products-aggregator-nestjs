import { Module } from '@nestjs/common';
import { EventsProviderService } from './events.service';

@Module({
  providers: [EventsProviderService],
  exports: [EventsProviderService],
})
export class EventsProviderModule {}

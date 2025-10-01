import { Module } from '@nestjs/common';
import { TicketingProviderService } from './ticketing.service';

@Module({
  providers: [TicketingProviderService],
  exports: [TicketingProviderService],
})
export class TicketingProviderModule {}

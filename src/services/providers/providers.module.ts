import { Module } from '@nestjs/common';
import { ECommerceProviderModule } from './e-commerce/e-commerce.module';
import { TicketingProviderModule } from './ticketing/ticketing.module';
import { EventsProviderModule } from './events/events.module';

@Module({
  imports: [
    ECommerceProviderModule,
    TicketingProviderModule,
    EventsProviderModule,
  ],
  exports: [
    ECommerceProviderModule,
    TicketingProviderModule,
    EventsProviderModule,
  ],
})
export class ProvidersModule {}
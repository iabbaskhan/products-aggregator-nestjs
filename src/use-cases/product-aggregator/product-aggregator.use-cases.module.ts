import { Module } from '@nestjs/common';
import { ProductAggregatorUseCases } from './product-aggregator.use-cases.service';
import { DataServicesModule } from '@services/database';
import { ECommerceProviderModule } from '@services/providers/e-commerce/e-commerce.module';
import { TicketingProviderModule } from '@services/providers/ticketing/ticketing.module';
import { EventsProviderModule } from '@services/providers/events/events.module';

@Module({
  imports: [
    DataServicesModule, 
    ECommerceProviderModule,
    TicketingProviderModule,
    EventsProviderModule,
  ],
  providers: [ProductAggregatorUseCases],
  exports: [ProductAggregatorUseCases],
})
export class ProductAggregatorUseCasesModule {}

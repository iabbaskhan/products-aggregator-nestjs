import { Module } from '@nestjs/common';
import { DataServicesModule } from '@services/database';
import { CronLogUseCases } from './cron-log-use-cases.service';
import { CronLogFactory } from './cron-log.factory';
import { ProductAggregatorUseCasesModule } from '../product-aggregator/product-aggregator.use-cases.module';

@Module({
  imports: [
    DataServicesModule,
    ProductAggregatorUseCasesModule,
  ],
  providers: [CronLogUseCases, CronLogFactory],
  exports: [CronLogFactory, CronLogUseCases],
})
export class CronLogUseCasesModule {}

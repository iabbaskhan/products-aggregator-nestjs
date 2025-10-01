import { Module } from '@nestjs/common';
import { DataServicesModule } from '@services/database';
import {
  CronLogUseCasesModule,
  ProductAggregatorUseCasesModule,
} from '@useCases';
import { CronsService } from './crons-service';

@Module({
  imports: [
    DataServicesModule,
    CronLogUseCasesModule,
    ProductAggregatorUseCasesModule,
  ],
  providers: [CronsService],
})
export class CronsModule {}

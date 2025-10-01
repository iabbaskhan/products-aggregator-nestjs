import { Module } from '@nestjs/common';
import { CronLogUseCasesModule, ProductAggregatorUseCasesModule } from '@useCases';
import * as allControllers from '.';
import { AuthModule } from '@auth';
import { ProductsModule } from './products/products.module';
import { VisualizationModule } from './visualization/visualization.module';

@Module({
  imports: [
    AuthModule,
    CronLogUseCasesModule,
    ProductsModule,
    ProductAggregatorUseCasesModule,
    VisualizationModule,
  ],
  providers: [],
  controllers: [...Object.values(allControllers)],
})
export class ControllersModule {}

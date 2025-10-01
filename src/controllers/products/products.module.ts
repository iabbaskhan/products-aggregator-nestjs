import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductAggregatorUseCasesModule } from '@useCases';
import { AuthModule } from '@auth';

@Module({
  imports: [ProductAggregatorUseCasesModule, AuthModule],
  controllers: [ProductsController],
})
export class ProductsModule {}

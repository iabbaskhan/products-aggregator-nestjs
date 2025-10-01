import { Module } from '@nestjs/common';
import { ECommerceProviderService } from './e-commerce.service';

@Module({
  providers: [ECommerceProviderService],
  exports: [ECommerceProviderService],
})
export class ECommerceProviderModule {}

import { Module } from '@nestjs/common';
import { PrismaDataServicesModule } from './prisma';

@Module({
  imports: [PrismaDataServicesModule],
  exports: [PrismaDataServicesModule],
})
export class DataServicesModule {}

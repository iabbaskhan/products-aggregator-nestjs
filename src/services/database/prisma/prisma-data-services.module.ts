import { Module } from '@nestjs/common';
import { ConfigService } from '@config';
import { PrismaService } from './prisma.service';
import { PrismaConfigService } from './prisma-config.service';
import { PrismaDataServices } from './prisma-data-services.service';
import { IDataServices } from '@abstracts';

@Module({
  imports: [],
  providers: [
    PrismaConfigService,
    {
      provide: PrismaService,
      useFactory: (prismaConfigService: PrismaConfigService) => {
        return new PrismaService(prismaConfigService);
      },
      inject: [PrismaConfigService],
    },
    {
      provide: IDataServices,
      useClass: PrismaDataServices,
    },
  ],
  exports: [IDataServices, PrismaService, PrismaConfigService],
})
export class PrismaDataServicesModule {}

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaRepository } from './prisma.repository';
import { IDataServices } from '@abstracts';
import { Product, Provider, PriceHistory, CronLog } from '@prisma/client';

@Injectable()
export class PrismaDataServices implements IDataServices, OnModuleInit, OnModuleDestroy {
  public readonly products: PrismaRepository<Product>;
  public readonly providers: PrismaRepository<Provider>;
  public readonly priceHistory: PrismaRepository<PriceHistory>;
  public readonly cronLog: PrismaRepository<CronLog>;

  constructor(private readonly prisma: PrismaService) {
    this.products = new PrismaRepository(prisma, 'product');
    this.providers = new PrismaRepository(prisma, 'provider');
    this.priceHistory = new PrismaRepository(prisma, 'priceHistory');
    this.cronLog = new PrismaRepository(prisma, 'cronLog');
  }

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}

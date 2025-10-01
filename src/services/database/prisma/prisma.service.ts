import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaConfigService } from './prisma-config.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private isConnected = false;

  constructor(private readonly prismaConfigService: PrismaConfigService) {
    super();
  }

  async onModuleInit() {
    try {
      const databaseUrl = this.prismaConfigService.getDatabaseUrl();
      
      process.env.DATABASE_URL = databaseUrl;
      
      await this.$connect();
      
      this.isConnected = true;
      console.log('✅ PrismaService connected to database');
    } catch (error) {
      console.error('❌ Failed to connect PrismaService to database:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.isConnected) {
      await this.$disconnect();
    }
  }
}

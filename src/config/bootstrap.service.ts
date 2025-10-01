import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from './config.service';

/**
 * Bootstrap service that ensures ConfigService is fully initialized
 * before any other services that depend on it
 */
@Injectable()
export class BootstrapService implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    if (!this.configService.allSecretsLoaded()) {
      throw new Error('ConfigService secrets not loaded during bootstrap');
    }
    
    console.log('✅ ConfigService bootstrap completed - all secrets loaded');
  }

  /**
   * Check if the application is ready to start
   */
  isReady(): boolean {
    return this.configService.allSecretsLoaded();
  }
}

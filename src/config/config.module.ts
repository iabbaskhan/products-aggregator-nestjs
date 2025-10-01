import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { BootstrapService } from './bootstrap.service';

@Global()
@Module({
  providers: [BootstrapService],
  exports: [BootstrapService],
})
export class ConfigModule {
  static async forRootAsync(): Promise<DynamicModule> {
    const configService = new ConfigService();
    await configService.loadSecrets();
    if (!configService.allSecretsLoaded()) {
      throw new Error('Failed to load all secrets');
    }

    return {
      module: ConfigModule,
      providers: [
        {
          provide: ConfigService,
          useValue: configService,
        },
        BootstrapService,
      ],
      exports: [ConfigService, BootstrapService],
    };
  }
}

import { Module, RequestMethod } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@config';
import { LoggerModule } from 'nestjs-pino';
import { DataServicesModule } from '@services/database';
import { ControllersModule } from '@controllers';
import { CronsModule } from '@services/crons';
import { AuthModule } from '@auth';
import { ProductAggregatorUseCasesModule } from '@useCases';

@Module({
  imports: [
    ConfigModule.forRootAsync(),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  singleLine: true,
                },
              }
            : undefined,
      },
      exclude: [{ method: RequestMethod.ALL, path: 'check' }],
    }),
    DataServicesModule,
    AuthModule,
    ControllersModule,
    ScheduleModule.forRoot(),
    CronsModule,
    ProductAggregatorUseCasesModule,
  ],
})
export class AppModule {}

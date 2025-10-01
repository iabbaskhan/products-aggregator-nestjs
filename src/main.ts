import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService, BootstrapService } from '@config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    rawBody: true,
  });
  const config = new DocumentBuilder()
    .setTitle('Product Aggregator API')
    .setVersion('0.0.1')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.useLogger(app.get(Logger));
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableCors();
  
  const bootstrapService = app.get(BootstrapService);
  const configService = app.get(ConfigService);
  
  if (!bootstrapService.isReady()) {
    throw new Error('Application bootstrap failed - secrets not properly loaded');
  }
  
  console.log('🚀 Application bootstrap completed successfully');
  await app.listen(configService.appSecrets.PORT);
}
bootstrap();

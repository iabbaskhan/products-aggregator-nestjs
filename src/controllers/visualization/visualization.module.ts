import { Module } from '@nestjs/common';
import { VisualizationController } from './visualization.controller';
import { AuthModule } from '@auth';

@Module({
  imports: [AuthModule],
  controllers: [VisualizationController],
})
export class VisualizationModule {}

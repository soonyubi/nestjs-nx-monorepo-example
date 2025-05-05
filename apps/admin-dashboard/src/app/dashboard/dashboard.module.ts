import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { DbModule } from '@org/db';
@Module({
  imports: [DbModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}

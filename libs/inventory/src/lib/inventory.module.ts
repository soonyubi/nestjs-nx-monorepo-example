import { Module } from '@nestjs/common';
import { StockAlertProvider } from './providers/stock-alert.provider';

@Module({
  providers: [StockAlertProvider],
  exports: [StockAlertProvider],
})
export class InventoryModule {}

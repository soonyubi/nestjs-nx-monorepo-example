import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { InventoryModule as InventoryLibModule } from '@org/inventory';
import { DbModule } from '@org/db';

@Module({
  imports: [InventoryLibModule, DbModule],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}

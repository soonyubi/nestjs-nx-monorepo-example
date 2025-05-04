import { StockUpdateReason } from '@org/inventory';

export class UpdateStockDto {
  quantity!: number;
  action!: 'add' | 'subtract';
  reason!: StockUpdateReason;
  reference?: string;
}

export class CheckStockDto {
  requiredQuantity!: number;
}

export class SetStockAlertThresholdDto {
  thresholdStock!: number;
}

export class StockHistoryDto {
  id!: string;
  productId!: string;
  quantity!: number;
  actionType!: 'add' | 'subtract';
  reason!: StockUpdateReason;
  reference?: string;
  previousStock!: number;
  newStock!: number;
  createdAt!: Date;
}

export class ProductStockDto {
  id!: string;
  name!: string;
  stock!: number;
  lowStockThreshold!: number;
  sku?: string;
}

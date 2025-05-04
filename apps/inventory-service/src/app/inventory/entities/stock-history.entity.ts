import { StockUpdateReason } from '@org/inventory';

export class StockHistory {
  id!: string;
  productId!: string;
  quantity!: number;
  actionType!: 'add' | 'subtract';
  reason!: StockUpdateReason;
  reference?: string;
  previousStock!: number;
  newStock!: number;
  createdAt!: Date;
  updatedAt!: Date;
}

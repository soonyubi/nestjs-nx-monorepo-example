export interface StockUpdateDto {
  productId: string;
  quantity: number;
  action: 'add' | 'subtract';
  reason: StockUpdateReason;
  reference?: string; // 주문 번호, 반품 ID 등의 참조
}

export enum StockUpdateReason {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  RETURN = 'RETURN',
  DAMAGE = 'DAMAGE',
  INVENTORY_ADJUSTMENT = 'INVENTORY_ADJUSTMENT',
  INITIAL_STOCK = 'INITIAL_STOCK',
}

export interface StockAlertDto {
  productId: string;
  currentStock: number;
  thresholdStock: number;
  alertType: 'LOW_STOCK' | 'OUT_OF_STOCK';
}

export interface StockCheckDto {
  productId: string;
  requiredQuantity: number;
}

export interface StockCheckResultDto {
  productId: string;
  available: boolean;
  currentStock: number;
  requiredQuantity: number;
  shortageAmount?: number;
}

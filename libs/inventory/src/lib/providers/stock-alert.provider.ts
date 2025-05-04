import { Injectable } from '@nestjs/common';
import { StockAlertDto } from '../interfaces/inventory.interface';

@Injectable()
export class StockAlertProvider {
  private listeners: ((alert: StockAlertDto) => void)[] = [];

  addListener(callback: (alert: StockAlertDto) => void) {
    this.listeners.push(callback);
    return this.listeners.length - 1; // 리스너 ID 반환
  }

  removeListener(id: number) {
    if (id >= 0 && id < this.listeners.length) {
      this.listeners.splice(id, 1);
      return true;
    }
    return false;
  }

  async sendAlert(alert: StockAlertDto) {
    console.log(
      `STOCK ALERT: ${alert.alertType} for product ${alert.productId}. Current stock: ${alert.currentStock}, Threshold: ${alert.thresholdStock}`
    );

    // 등록된 모든 리스너에게 알림 전송
    this.listeners.forEach((listener) => {
      listener(alert);
    });

    // 실제 구현에서는 여기서 이메일이나 SMS 알림을 보낼 수 있습니다
    return true;
  }
}

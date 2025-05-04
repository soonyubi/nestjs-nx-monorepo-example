export class PriceUtils {
  /**
   * 가격을 통화 형식으로 포맷팅합니다. (예: ₩1,000)
   */
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  static formatPrice(price: number, currency: string = '₩'): string {
    return `${currency}${price.toLocaleString()}`;
  }

  /**
   * 상품 가격에 할인을 적용합니다.
   * @param price 원래 가격
   * @param discountRate 할인율 (0-100)
   * @returns 할인된 가격
   */
  static applyDiscount(price: number, discountRate: number): number {
    if (discountRate < 0 || discountRate > 100) {
      throw new Error('Discount rate must be between 0 and 100');
    }
    return Math.round(price * (1 - discountRate / 100));
  }

  /**
   * 가격에 세금을 적용합니다.
   * @param price 원래 가격
   * @param taxRate 세율 (예: 10)
   * @returns 세금이 포함된 가격
   */
  static applyTax(price: number, taxRate: number): number {
    return Math.round(price * (1 + taxRate / 100));
  }
}

import { Injectable, BadRequestException } from '@nestjs/common';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import { ProcessPaymentDto } from '../interfaces/payment.interface';

@Injectable()
export class PaymentProcessorProvider {
  async processPayment(paymentData: ProcessPaymentDto): Promise<{
    status: PaymentStatus;
    transactionId: string;
  }> {
    const { method, amount } = paymentData;

    // 실제 구현에서는 외부 결제 게이트웨이와 통합하게 됩니다
    switch (method) {
      case PaymentMethod.CREDIT_CARD:
        return this.processCreditCardPayment(paymentData);
      case PaymentMethod.BANK_TRANSFER:
        return this.processBankTransferPayment(paymentData);
      case PaymentMethod.PAYPAL:
        return this.processPaypalPayment(paymentData);
      default:
        throw new BadRequestException(`Unsupported payment method: ${method}`);
    }
  }

  async refundPayment(
    transactionId: string,
    amount: number
  ): Promise<{
    success: boolean;
    refundId: string;
  }> {
    // 실제 구현에서는 외부 결제 게이트웨이의 환불 API를 호출합니다
    console.log(
      `Refunding payment with transaction ID: ${transactionId}, amount: ${amount}`
    );

    // 여기서는 항상 성공한다고 가정
    return {
      success: true,
      refundId: `refund_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    };
  }

  private async processCreditCardPayment(
    paymentData: ProcessPaymentDto
  ): Promise<{
    status: PaymentStatus;
    transactionId: string;
  }> {
    const { cardNumber, cardExpiry, cardCvv } = paymentData;

    // 카드 정보 유효성 검사 (실제 구현에서는 더 철저한 검증이 필요합니다)
    if (!cardNumber || !cardExpiry || !cardCvv) {
      throw new BadRequestException(
        'Card details are required for credit card payment'
      );
    }

    // 카드 번호 마스킹 (로깅 목적)
    const maskedCardNumber = `${cardNumber.slice(0, 4)}****${cardNumber.slice(
      -4
    )}`;
    console.log(
      `Processing credit card payment with card: ${maskedCardNumber}`
    );

    // 여기서는 항상 성공한다고 가정 (실제로는 결제 게이트웨이 API 호출)
    return {
      status: PaymentStatus.COMPLETED,
      transactionId: `cc_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    };
  }

  private async processBankTransferPayment(
    paymentData: ProcessPaymentDto
  ): Promise<{
    status: PaymentStatus;
    transactionId: string;
  }> {
    const { bankAccount, bankName } = paymentData;

    if (!bankAccount || !bankName) {
      throw new BadRequestException(
        'Bank details are required for bank transfer payment'
      );
    }

    console.log(
      `Processing bank transfer payment to account: ${bankAccount}, bank: ${bankName}`
    );

    // 은행 이체는 보류 상태로 시작 (수동 확인 필요)
    return {
      status: PaymentStatus.PENDING,
      transactionId: `bt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    };
  }

  private async processPaypalPayment(paymentData: ProcessPaymentDto): Promise<{
    status: PaymentStatus;
    transactionId: string;
  }> {
    const { paypalEmail } = paymentData;

    if (!paypalEmail) {
      throw new BadRequestException(
        'PayPal email is required for PayPal payment'
      );
    }

    console.log(`Processing PayPal payment with email: ${paypalEmail}`);

    // 여기서는 항상 성공한다고 가정
    return {
      status: PaymentStatus.COMPLETED,
      transactionId: `pp_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    };
  }
}

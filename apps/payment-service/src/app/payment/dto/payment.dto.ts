import { PaymentMethod, PaymentStatus } from '@prisma/client';

export class CreatePaymentDto {
  orderId!: string;
  amount!: number;
  method!: PaymentMethod;
  cardNumber?: string;
  cardHolder?: string;
  cardExpiry?: string;
  cardCvv?: string;
  bankAccount?: string;
  bankName?: string;
  paypalEmail?: string;
}

export class PaymentResponseDto {
  id!: string;
  orderId!: string;
  amount!: number;
  method!: PaymentMethod;
  status!: PaymentStatus;
  transactionId?: string;
  createdAt!: Date;
  updatedAt!: Date;
}

export class RefundPaymentDto {
  reason?: string;
}

export class UpdatePaymentStatusDto {
  status!: PaymentStatus;
  transactionId?: string;
}

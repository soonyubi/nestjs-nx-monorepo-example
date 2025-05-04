import { PaymentMethod, PaymentStatus } from '@prisma/client';

export interface ProcessPaymentDto {
  orderId: string;
  amount: number;
  method: PaymentMethod;
  cardNumber?: string;
  cardHolder?: string;
  cardExpiry?: string;
  cardCvv?: string;
  bankAccount?: string;
  bankName?: string;
  paypalEmail?: string;
}

export interface PaymentResponseDto {
  id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RefundPaymentDto {
  paymentId: string;
  reason?: string;
}

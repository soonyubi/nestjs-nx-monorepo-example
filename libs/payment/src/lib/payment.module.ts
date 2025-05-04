import { Module } from '@nestjs/common';
import { PaymentProcessorProvider } from './providers/payment-processor.provider';

@Module({
  providers: [PaymentProcessorProvider],
  exports: [PaymentProcessorProvider],
})
export class PaymentModule {}

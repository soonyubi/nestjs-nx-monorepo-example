import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PaymentModule as PaymentLibModule } from '@org/payment';
import { DbModule } from '@org/db';

@Module({
  imports: [PaymentLibModule, DbModule],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}

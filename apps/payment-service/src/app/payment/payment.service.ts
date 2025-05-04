import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@org/db';
import { PaymentProcessorProvider } from '@org/payment';
import { PaymentStatus } from '@prisma/client';
import {
  CreatePaymentDto,
  RefundPaymentDto,
  UpdatePaymentStatusDto,
} from './dto/payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentProcessor: PaymentProcessorProvider
  ) {}

  async createPayment(createPaymentDto: CreatePaymentDto) {
    const { orderId, amount, method } = createPaymentDto;

    // 주문이 존재하는지 확인
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // 이미 결제가 존재하는지 확인
    if (order.payment) {
      throw new BadRequestException(
        `Payment already exists for order ${orderId}`
      );
    }

    // 주문 총액과 결제 금액이 일치하는지 확인
    if (order.totalAmount !== amount) {
      throw new BadRequestException(
        `Payment amount (${amount}) does not match order total (${order.totalAmount})`
      );
    }

    // 결제 처리
    const paymentResult = await this.paymentProcessor.processPayment(
      createPaymentDto
    );

    // 결제 정보 저장
    const payment = await this.prisma.payment.create({
      data: {
        amount,
        method,
        status: paymentResult.status,
        transactionId: paymentResult.transactionId,
        order: {
          connect: { id: orderId },
        },
      },
    });

    // 주문 상태 업데이트
    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status:
          paymentResult.status === PaymentStatus.COMPLETED
            ? 'PROCESSING'
            : 'PENDING',
      },
    });

    return payment;
  }

  async getPaymentByOrderId(orderId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { orderId },
    });

    if (!payment) {
      throw new NotFoundException(`Payment for order ${orderId} not found`);
    }

    return payment;
  }

  async refundPayment(paymentId: string, refundPaymentDto: RefundPaymentDto) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: true,
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException(
        `Cannot refund payment with status ${payment.status}`
      );
    }

    // 환불 처리
    const refundResult = await this.paymentProcessor.refundPayment(
      payment.transactionId ?? '',
      payment.amount
    );

    if (!refundResult.success) {
      throw new BadRequestException('Failed to process refund');
    }

    // 결제 상태 업데이트
    const updatedPayment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.REFUNDED,
      },
    });

    // 주문 상태 업데이트
    await this.prisma.order.update({
      where: { id: payment.orderId },
      data: {
        status: 'CANCELLED',
      },
    });

    return {
      ...updatedPayment,
      refundId: refundResult.refundId,
      reason: refundPaymentDto.reason,
    };
  }

  async updatePaymentStatus(
    paymentId: string,
    updatePaymentStatusDto: UpdatePaymentStatusDto
  ) {
    const { status, transactionId } = updatePaymentStatusDto;

    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }

    const updatedPayment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status,
        ...(transactionId && { transactionId }),
      },
    });

    // 결제 상태가 완료로 변경된 경우 주문 상태 업데이트
    if (status === PaymentStatus.COMPLETED) {
      await this.prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: 'PROCESSING',
        },
      });
    }

    return updatedPayment;
  }

  async getAllPayments(page = 1, limit = 10) {
    const totalItems = await this.prisma.payment.count();

    const payments = await this.prisma.payment.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        order: {
          select: {
            orderNumber: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return {
      data: payments,
      meta: {
        totalItems,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    };
  }
}

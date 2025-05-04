import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@org/db';
import { OrderStatus } from '@prisma/client';
import { UpdateOrderStatusDto } from './dto/order.dto';
import { PaginationUtils } from '@org/utils';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, limit = 10) {
    const totalItems = await this.prisma.order.count();

    const orders = await this.prisma.order.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        payment: true,
        address: true,
      },
    });

    const paginationMeta = PaginationUtils.createPaginationMeta({
      page,
      limit,
      totalItems,
    });

    return {
      data: orders,
      meta: paginationMeta,
    };
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: true,
          },
        },
        payment: true,
        address: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async updateStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto) {
    const { status } = updateOrderStatusDto;

    // 주문이 존재하는지 확인
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return this.prisma.order.update({
      where: { id },
      data: {
        status,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async getOrderStats() {
    const totalOrders = await this.prisma.order.count();

    const ordersByStatus = await this.prisma.$queryRaw`
      SELECT status, COUNT(*) as count 
      FROM "Order" 
      GROUP BY status
    `;

    const totalRevenue = await this.prisma.order.aggregate({
      where: {
        status: {
          in: [OrderStatus.DELIVERED, OrderStatus.SHIPPED],
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    const recentOrders = await this.prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      totalOrders,
      ordersByStatus,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      recentOrders,
    };
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@org/db';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    // 총 사용자 수
    const totalUsers = await this.prisma.user.count();

    // 총 제품 수
    const totalProducts = await this.prisma.product.count();

    // 총 주문 수
    const totalOrders = await this.prisma.order.count();

    // 총 카테고리 수
    const totalCategories = await this.prisma.category.count();

    // 총 매출
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

    // 주문 상태별 통계
    const ordersByStatus = await this.prisma.$queryRaw`
      SELECT status, COUNT(*) as count 
      FROM "Order" 
      GROUP BY status
    `;

    // 최근 등록된 사용자
    const recentUsers = await this.prisma.user.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // 최근 생성된 주문
    const recentOrders = await this.prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    // 많이 팔린 제품 상위 5개
    const topSellingProducts = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 5,
    });

    // 상위 판매 제품 세부 정보 가져오기
    const topProductIds = topSellingProducts.map((item) => item.productId);
    const topProducts = await this.prisma.product.findMany({
      where: {
        id: {
          in: topProductIds,
        },
      },
    });

    // 판매량과 제품 정보 결합
    const topSellingProductsWithDetails = topSellingProducts.map((item) => {
      const product = topProducts.find((p) => p.id === item.productId);
      return {
        id: item.productId,
        name: product?.name,
        totalSold: item._sum.quantity,
      };
    });

    return {
      counts: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalCategories,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
      },
      ordersByStatus,
      recentUsers,
      recentOrders,
      topSellingProducts: topSellingProductsWithDetails,
    };
  }
}

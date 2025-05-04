import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@org/db';
import { StockAlertProvider, StockUpdateReason } from '@org/inventory';
import {
  CheckStockDto,
  SetStockAlertThresholdDto,
  UpdateStockDto,
} from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stockAlertProvider: StockAlertProvider
  ) {}

  async updateStock(productId: string, updateStockDto: UpdateStockDto) {
    const { quantity, action, reason, reference } = updateStockDto;

    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    // 제품이 존재하는지 확인
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // 현재 재고
    const currentStock = product.stock;
    let newStock = currentStock;

    // 재고 업데이트
    if (action === 'add') {
      newStock = currentStock + quantity;
    } else if (action === 'subtract') {
      if (currentStock < quantity) {
        throw new BadRequestException('Not enough stock available');
      }
      newStock = currentStock - quantity;
    }

    // 재고 이력 생성 (트랜잭션으로 처리)
    const result = await this.prisma.$transaction(async (prisma) => {
      // 제품 재고 업데이트
      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: {
          stock: newStock,
        },
      });

      // 재고 이력 기록 (실제로는 Prisma 모델을 생성해야 합니다)
      // 여기서는 로그로 대체
      console.log(
        `Stock update: Product ${productId}, ${action} ${quantity}, reason: ${reason}, reference: ${reference}`
      );
      console.log(`Previous stock: ${currentStock}, New stock: ${newStock}`);

      return updatedProduct;
    });

    // 재고 알림 검사
    await this.checkStockAlerts(productId, newStock);

    return {
      productId,
      previousStock: currentStock,
      newStock,
      action,
      quantity,
      reason,
      reference,
      timestamp: new Date(),
    };
  }

  async checkStock(productId: string, checkStockDto: CheckStockDto) {
    const { requiredQuantity } = checkStockDto;

    if (requiredQuantity <= 0) {
      throw new BadRequestException('Required quantity must be greater than 0');
    }

    // 제품이 존재하는지 확인
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    const isAvailable = product.stock >= requiredQuantity;
    return {
      productId,
      available: isAvailable,
      currentStock: product.stock,
      requiredQuantity,
      ...(!isAvailable && { shortageAmount: requiredQuantity - product.stock }),
    };
  }

  async setStockAlertThreshold(
    productId: string,
    setStockAlertThresholdDto: SetStockAlertThresholdDto
  ) {
    const { thresholdStock } = setStockAlertThresholdDto;

    if (thresholdStock < 0) {
      throw new BadRequestException('Threshold stock cannot be negative');
    }

    // 제품이 존재하는지 확인
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // 저장할 컬럼이 실제로 있다고 가정 (prisma 스키마에 추가 필요)
    // 여기서는 Product 모델에 lowStockThreshold 필드가 추가되어 있다고 가정합니다
    const updatedProduct = await this.prisma.product.update({
      where: { id: productId },
      data: {
        // 실제 스키마에 맞게 필드명 수정 필요
        // lowStockThreshold: thresholdStock,
      },
    });

    // 현재 재고를 기준으로 알림 검사
    await this.checkStockAlerts(
      productId,
      updatedProduct.stock,
      thresholdStock
    );

    return {
      productId,
      thresholdStock,
      currentStock: updatedProduct.stock,
    };
  }

  private async checkStockAlerts(
    productId: string,
    currentStock: number,
    thresholdStock?: number
  ) {
    // 실제 구현에서는 DB에서 thresholdStock 값을 가져옵니다
    // 여기서는 임의의 값을 사용하거나 파라미터로 전달받은 값을 사용합니다
    const threshold = thresholdStock || 10; // 기본 임계값

    if (currentStock <= 0) {
      // 재고가 없는 경우
      await this.stockAlertProvider.sendAlert({
        productId,
        currentStock,
        thresholdStock: threshold,
        alertType: 'OUT_OF_STOCK',
      });
    } else if (currentStock <= threshold) {
      // 재고가 임계값 이하인 경우
      await this.stockAlertProvider.sendAlert({
        productId,
        currentStock,
        thresholdStock: threshold,
        alertType: 'LOW_STOCK',
      });
    }
  }

  async getProductStock(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        stock: true,
        // lowStockThreshold: true, // 실제 스키마에 필드 추가 후 주석 해제
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    return {
      ...product,
      lowStockThreshold: 10, // 임시 기본값 (실제로는 DB에서 가져옵니다)
    };
  }

  async getAllProductsStock(page = 1, limit = 10, searchTerm?: string) {
    const where = searchTerm
      ? {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            // { sku: { contains: searchTerm, mode: 'insensitive' } }, // SKU 필드가 있다면 추가
          ],
        }
      : {};

    const totalItems = await this.prisma.product.count({ where });

    const products = await this.prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        stock: true,
        // lowStockThreshold: true, // 실제 스키마에 필드 추가 후 주석 해제
        // sku: true, // SKU 필드가 있다면 추가
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        stock: 'asc', // 재고 적은 순으로 정렬
      },
    });

    // 임시로 lowStockThreshold 값을 추가합니다
    const productsWithThreshold = products.map((product) => ({
      ...product,
      lowStockThreshold: 10, // 임시 기본값
    }));

    return {
      data: productsWithThreshold,
      meta: {
        totalItems,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    };
  }

  async getLowStockProducts() {
    // 실제 구현에서는 lowStockThreshold 필드와 비교합니다
    // 여기서는 임시로 10 미만인 제품을 가져옵니다
    const lowStockProducts = await this.prisma.product.findMany({
      where: {
        stock: {
          lt: 10, // 임시 임계값
        },
      },
      select: {
        id: true,
        name: true,
        stock: true,
        // lowStockThreshold: true, // 실제 스키마에 필드 추가 후 주석 해제
      },
      orderBy: {
        stock: 'asc',
      },
    });

    // 임시로 lowStockThreshold 값을 추가합니다
    return lowStockProducts.map((product) => ({
      ...product,
      lowStockThreshold: 10, // 임시 기본값
    }));
  }
}

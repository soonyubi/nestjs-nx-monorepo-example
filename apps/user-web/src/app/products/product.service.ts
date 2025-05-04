// apps/user-web/src/app/products/products.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@org/db';
import { PaginationUtils } from '@org/utils';
import { Prisma } from '@prisma/client';
import {
  CreateProductDto,
  ProductQueryDto,
  UpdateProductDto,
} from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ProductQueryDto) {
    const {
      category,
      minPrice,
      maxPrice,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortDirection = 'desc',
    } = query;

    // 필터 조건 구성
    const where = {
      ...(search
        ? {
            OR: [
              {
                name: { contains: search, mode: Prisma.QueryMode.insensitive },
              },
              {
                description: {
                  contains: search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            ],
          }
        : {}),
      ...(category
        ? {
            categories: {
              some: {
                name: { equals: category, mode: Prisma.QueryMode.insensitive },
              },
            },
          }
        : {}),
      ...(minPrice || maxPrice
        ? {
            price: {
              ...(minPrice ? { gte: minPrice } : {}),
              ...(maxPrice ? { lte: maxPrice } : {}),
            },
          }
        : {}),
    };

    // 정렬 설정
    const orderBy = {
      [sortBy]: sortDirection,
    };

    // 총 제품 수 계산
    const totalItems = await this.prisma.product.count({ where });

    // 페이지네이션 적용하여 제품 조회
    const products = await this.prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        categories: {
          select: {
            id: true,
            name: true,
          },
        },
        images: {
          select: {
            id: true,
            url: true,
          },
        },
      },
    });

    // 페이지네이션 메타데이터 생성
    const paginationMeta = PaginationUtils.createPaginationMeta({
      page,
      limit,
      totalItems,
    });

    return {
      data: products,
      meta: paginationMeta,
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
          },
        },
        images: {
          select: {
            id: true,
            url: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async create(createProductDto: CreateProductDto) {
    const {
      name,
      description,
      price,
      stock,
      categoryIds = [],
    } = createProductDto;

    return this.prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
        categories: {
          connect: categoryIds.map((id) => ({ id })),
        },
      },
      include: {
        categories: true,
      },
    });
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { name, description, price, stock, categoryIds } = updateProductDto;

    // 제품이 존재하는지 확인
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // 카테고리 연결 설정
    const categoriesData = categoryIds
      ? {
          set: [], // 기존 연결 제거
          connect: categoryIds.map((id) => ({ id })), // 새 카테고리 연결
        }
      : undefined;

    return this.prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price !== undefined && { price }),
        ...(stock !== undefined && { stock }),
        ...(categoriesData && { categories: categoriesData }),
      },
      include: {
        categories: true,
        images: true,
      },
    });
  }

  async remove(id: string) {
    // 제품이 존재하는지 확인
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // 제품 삭제
    return this.prisma.product.delete({
      where: { id },
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@org/db';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const { name, description } = createCategoryDto;

    return this.prisma.category.create({
      data: {
        name,
        description,
      },
    });
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const { name, description } = updateCategoryDto;

    // 카테고리가 존재하는지 확인
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
      },
    });
  }

  async remove(id: string) {
    // 카테고리가 존재하는지 확인
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }
}

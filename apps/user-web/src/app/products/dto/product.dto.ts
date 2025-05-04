export class CreateProductDto {
  name!: string;
  description!: string;
  price!: number;
  stock!: number;
  categoryIds?: string[];
}

export class UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  categoryIds?: string[];
}

export class ProductResponseDto {
  id!: string;
  name!: string;
  description!: string;
  price!: number;
  stock!: number;
  categories!: {
    id: string;
    name: string;
  }[];
  images!: {
    id: string;
    url: string;
  }[];
  createdAt!: Date;
  updatedAt!: Date;
}

export class ProductQueryDto {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'price' | 'createdAt';
  sortDirection?: 'asc' | 'desc';
}

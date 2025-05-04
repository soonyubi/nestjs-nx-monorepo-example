export class CreateCategoryDto {
  name!: string;
  description?: string;
}

export class UpdateCategoryDto {
  name?: string;
  description?: string;
}

export class CategoryResponseDto {
  id!: string;
  name!: string;
  description?: string;
  createdAt!: Date;
  updatedAt!: Date;
}

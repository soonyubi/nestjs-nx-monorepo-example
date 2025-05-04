export interface PaginationOptions {
  page: number;
  limit: number;
  totalItems: number;
}

export interface PaginationResult<T> {
  items: T[];
  meta: {
    totalItems: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export class PaginationUtils {
  /**
   * 페이지네이션 메타데이터를 생성합니다.
   */
  static createPaginationMeta(options: PaginationOptions) {
    const { page, limit, totalItems } = options;
    const totalPages = Math.ceil(totalItems / limit);

    return {
      totalItems,
      itemsPerPage: limit,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  /**
   * 배열에 페이지네이션을 적용합니다.
   */
  static paginate<T>(
    items: T[],
    options: PaginationOptions
  ): PaginationResult<T> {
    const { page, limit } = options;
    const startIndex = (page - 1) * limit;
    const paginatedItems = items.slice(startIndex, startIndex + limit);

    return {
      items: paginatedItems,
      meta: this.createPaginationMeta(options),
    };
  }
}

export interface QueryParams {
  filter?: Record<string, any>;
  sort?: string;
  fields?: string;
  page?: string | number;
  limit?: string | number;
  keyword?: string;
}

export interface PaginationResult {
  total: number;
  page: number;
  pages: number;
  limit: number;
  nextPage: number | null;
  prevPage: number | null;
}

export class ApiFeatures {
  filters: Record<string, any> = {};
  orderBy: Record<string, 'asc' | 'desc'> = {};
  select?: Record<string, boolean>;
  skip = 0;
  take = 20;

  // TODO: FIX filters
  // TODO: Add Keyword
  constructor(private query: QueryParams) {}

  filter(): this {
    if (this.query?.filter) {
      this.filters = this.query.filter;
    }
    return this;
  }

  sort(): this {
    if (this.query?.sort) {
      const [field, order] = this.query.sort.split(',');
      this.orderBy = { [field]: order === 'desc' ? 'desc' : 'asc' };
    }
    return this;
  }

  limitFields(): this {
    if (this.query?.fields) {
      this.select = this.query.fields
        .split(',')
        .reduce<Record<string, boolean>>((acc, field) => {
          acc[field] = true;
          return acc;
        }, {});
    }
    return this;
  }

  paginate(): this {
    const page = Number(this.query?.page) || 1;
    const limit = Number(this.query?.limit) || 20;
    this.skip = (page - 1) * limit;
    this.take = limit;
    return this;
  }
  search(fields: string[]): this {
    if (this.query?.keyword) {
      const keyword = this.query.keyword.trim();
      this.filters.OR = fields.map((field) => ({
        [field]: { contains: keyword, mode: 'insensitive' },
      }));
    }
    return this;
  }

  buildPagination(total: number): PaginationResult {
    const page = Number(this.query?.page) || 1;
    const limit = Number(this.query?.limit) || 20;
    const pages = Math.ceil(total / limit);

    const nextPage = page < pages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;

    return {
      total,
      page,
      pages,
      limit,
      nextPage,
      prevPage,
    };
  }
}

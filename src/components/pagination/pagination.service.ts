import { Injectable } from '@nestjs/common';

export interface PaginationParams {
  take?: number;
  page?: number;
}

@Injectable()
export class PaginationService {
  getDefaultPaginationParams(params: PaginationParams): {
    take: number;
    page: number;
  } {
    const take = params.take || 10;
    const page = params.page || 0;

    return { take, page };
  }
}

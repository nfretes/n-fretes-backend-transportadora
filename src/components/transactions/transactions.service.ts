import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transactions } from '@entities/transactions.entity';
import { ParamsTransactionsRequest } from './interfaces/ITransactionsParams';

export class TransactionsService {
  constructor(
    @InjectRepository(Transactions)
    private transactionsRepository: Repository<Transactions>,
  ) {}

  async getAllTransactions(
    userId: string,
    pagination: ParamsTransactionsRequest,
  ) {
    const { page = 1, take = 10 } = pagination;
    const skip = (page - 1) * take;

    const [transactions, total] =
      await this.transactionsRepository.findAndCount({
        where: { companyId: userId },
        skip,
        take: take,
        order: { createdAt: 'DESC' },
      });

    return {
      data: transactions,
      count: total,
      meta: {
        page,
        take,
        totalPages: Math.ceil(total / take),
      },
    };
  }
}

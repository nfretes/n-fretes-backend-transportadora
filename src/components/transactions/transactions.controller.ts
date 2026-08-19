import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { ParamsTransactionsRequest } from './interfaces/ITransactionsParams';
import { JwtAuthGuard } from 'src/guards/jwt-auth-guard';
import { GetUserId } from 'src/decorators/get-user-decorator';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  async getAllTransactions(
    @GetUserId() userId: string,
    @Query() pagination: ParamsTransactionsRequest,
  ) {
    return this.transactionsService.getAllTransactions(userId, pagination);
  }
}

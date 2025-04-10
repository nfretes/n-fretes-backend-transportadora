import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PlansCompany } from '@entities/plans-company.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PlansCompanyService {
  constructor(
    @InjectRepository(PlansCompany)
    private readonly plansCompanyRepository: Repository<PlansCompany>,
  ) {}

  async findAllActive(): Promise<PlansCompany[]> {
    return this.plansCompanyRepository.find({
      where: { status: true },
      order: { createdAt: 'ASC' },
    });
  }
}

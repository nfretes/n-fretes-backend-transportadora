import { Controller, Get } from '@nestjs/common';
import { PlansCompanyService } from './plans.company.service';
import { PlansCompany } from '@entities/plans-company.entity';

@Controller('plans-company')
export class PlansCompanyController {
  constructor(private readonly plansCompanyService: PlansCompanyService) {}

  @Get()
  async findAllActive(): Promise<PlansCompany[]> {
    return this.plansCompanyService.findAllActive();
  }
}

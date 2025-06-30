import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from 'src/entities/company.entity';

@Injectable()
export class CompanySearchService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async findByCnpj(cnpjInput: string): Promise<Omit<Company, 'password'>> {
    const norm = cnpjInput.replace(/\D/g, '');
    const companies = await this.companyRepository.find();
    const company = companies.find(c => c.cnpj?.replace(/\D/g, '') === norm);
    if (!company) {
      throw new NotFoundException('Transportadora não encontrada');
    }
    const { password, ...rest } = company;
    return rest;
  }
}

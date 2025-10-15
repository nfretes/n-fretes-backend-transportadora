import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
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
    const company = companies.find((c) => c.cnpj?.replace(/\D/g, '') === norm);
    if (!company) {
      throw new NotFoundException('Transportadora não encontrada');
    }
    const { password, ...rest } = company;
    return rest;
  }

  async getCnpjData(cnpjInput: string) {
    try {
      const cnpj = cnpjInput.replace(/\D/g, '');

      if (cnpj.length !== 14) {
        throw new HttpException(
          'CNPJ deve ter 14 dígitos',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Usando ReceitaWS - API gratuita de consulta CNPJ
      const response = await fetch(`https://receitaws.com.br/v1/cnpj/${cnpj}`);
      const data = await response.json();

      if (data.status === 'ERROR') {
        throw new NotFoundException('CNPJ não encontrado na Receita Federal');
      }

      return {
        cnpj: data.cnpj,
        razaoSocial: data.nome,
        nomeFantasia: data.fantasia,
        situacao: data.situacao,
        dataAbertura: data.abertura,
        naturezaJuridica: data.natureza_juridica,
        porte: data.porte,
        atividadePrincipal: data.atividade_principal?.[0],
        endereco: {
          logradouro: data.logradouro,
          numero: data.numero,
          complemento: data.complemento,
          bairro: data.bairro,
          municipio: data.municipio,
          uf: data.uf,
          cep: data.cep,
        },
        telefone: data.telefone,
        email: data.email,
        capitalSocial: data.capital_social,
        socios:
          data.qsa?.map((socio) => ({
            nome: socio.nome,
            qualificacao: socio.qual,
          })) || [],
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Erro ao consultar CNPJ na Receita Federal',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

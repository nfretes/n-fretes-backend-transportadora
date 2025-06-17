import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Form } from 'src/entities/forms.entity';
import { CreateFormDto } from './dto/create-form.dto';

@Injectable()
export class FormsService {
  constructor(
    @InjectRepository(Form)
    private readonly formRepository: Repository<Form>,
  ) {}

  async createForm(dto: CreateFormDto): Promise<{ resposta: true }> {
    if (!dto.nome) throw new BadRequestException('nome é obrigatório');
    if (!dto.whatsapp) throw new BadRequestException('whatsapp é obrigatório');
    if (!dto.cnpj) throw new BadRequestException('cnpj é obrigatório');
    const form = this.formRepository.create({
      ...dto,
      served: false,
    });
    await this.formRepository.save(form);
    return { resposta: true };
  }
}

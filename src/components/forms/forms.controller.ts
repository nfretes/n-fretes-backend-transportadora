import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';

@ApiTags('forms')
@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar formulário', description: 'Cria um novo registro de formulário.' })
  @ApiBody({ type: CreateFormDto })
  @ApiResponse({ status: 201, description: 'Formulário criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Parâmetro obrigatório faltando.' })
  async create(@Body() dto: CreateFormDto) {
    const form = await this.formsService.createForm(dto);
    return { message: 'Formulário criado com sucesso', form };
  }
}

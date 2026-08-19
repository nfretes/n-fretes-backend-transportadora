import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { UIFeaturesService } from './ui-features.service';
import { UIFeaturesSeedService } from './ui-features-seed.service';
import { UIFeatureType, UIFeatureCategory } from 'src/enum/ui-feature';

/**
 * DTO para criar uma nova feature
 */
export class CreateUIFeatureDto {
  key: string;
  name: string;
  description?: string;
  type: UIFeatureType;
  category: UIFeatureCategory;
  parentKey?: string;
  isVisible?: boolean;
  isActive?: boolean;
  displayOrder?: number;
  metadata?: any; 
}


export class UpdateVisibilityDto {
  isVisible: boolean;
}

@Controller('ui-features')
export class UIFeaturesController {
  constructor(
    private readonly uiFeaturesService: UIFeaturesService,
    private readonly uiFeaturesSeedService: UIFeaturesSeedService,
  ) {}

  /**
   * POST /ui-features
   * Criar uma nova feature
   * 
   * Body exemplo:
   * {
   *   "key": "freight.export.button",
   *   "name": "Botão Exportar",
   *   "type": "BUTTON",
   *   "category": "FREIGHT",
   *   "isVisible": false,
   *   "metadata": {
   *     "icon": "download",
   *     "premium": true
   *   }
   * }
   */
  @Post()
  async create(@Body() dto: CreateUIFeatureDto) {
    return await this.uiFeaturesService.createSimpleFeature();
  }

  /**
   * GET /ui-features
   * Listar todas as features
   */
  @Get()
  async findAll() {
    return await this.uiFeaturesService.getAllFeatures();
  }

  /**
   * GET /ui-features/visible
   * Listar apenas features visíveis
   */
  @Get('visible')
  async findVisible() {
    return await this.uiFeaturesService.getAllFeatures({
      isVisible: true,
      isActive: true,
    });
  }

  /**
   * GET /ui-features/category/:category
   * Listar features por categoria
   */
  @Get('category/:category')
  async findByCategory(@Param('category') category: UIFeatureCategory) {
    return await this.uiFeaturesService.getVisibleFeaturesByCategory(category);
  }

  /**
   * GET /ui-features/:key
   * Buscar feature pelo key
   */
  @Get(':key')
  async findOne(@Param('key') key: string) {
    return await this.uiFeaturesService.getFeatureByKey(key);
  }

  /**
   * PATCH /ui-features/:key/visibility
   * Atualizar visibilidade
   * 
   * Body exemplo:
   * {
   *   "isVisible": false
   * }
   */
  @Patch(':key/visibility')
  async updateVisibility(
    @Param('key') key: string,
    @Body() dto: UpdateVisibilityDto,
  ) {
    return await this.uiFeaturesService.updateFeatureVisibility(
      key,
      dto.isVisible,
    );
  }

  /**
   * POST /ui-features/seed
   * Popular o banco com features iniciais
   */
  @Post('seed')
  async seed() {
    return await this.uiFeaturesService.seedInitialFeatures();
  }

  /**
   * POST /ui-features/seed/mobile-app
   * ⭐ SEED COMPLETO - Cadastra TODAS as páginas do app mobile
   * Use este endpoint para popular o banco com todas as telas do seu app React Native
   */
  @Post('seed/mobile-app')
  async seedMobileApp() {
    return await this.uiFeaturesSeedService.seedMobileAppPages();
  }

  /**
   * GET /ui-features/pages/visible
   * Retorna apenas as páginas (screens) visíveis
   */
  @Get('pages/visible')
  async getVisiblePages() {
    return await this.uiFeaturesSeedService.getVisiblePages();
  }

  /**
   * POST /ui-features/hide-dev-pages
   * Oculta páginas de desenvolvimento (usar em produção)
   */
  @Post('hide-dev-pages')
  async hideDevPages() {
    return await this.uiFeaturesSeedService.hideDevPages();
  }
}

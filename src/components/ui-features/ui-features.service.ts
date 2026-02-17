import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UIFeature } from 'src/entities/ui-features.entity';
import { UIFeatureType, UIFeatureCategory } from 'src/enum/ui-feature';

@Injectable()
export class UIFeaturesService {
  constructor(
    @InjectRepository(UIFeature)
    private readonly uiFeaturesRepository: Repository<UIFeature>,
  ) {}

  /**
   * Exemplo 1: Criar uma feature simples
   */
  async createSimpleFeature() {
    const feature = this.uiFeaturesRepository.create({
      key: 'freight.create.button',
      name: 'Botão Criar Frete',
      description: 'Botão para criar um novo frete',
      type: UIFeatureType.BUTTON,
      category: UIFeatureCategory.FREIGHT,
      isVisible: true, // true = mostrar, false = ocultar
      isActive: true,
      displayOrder: 1,
    });

    return await this.uiFeaturesRepository.save(feature);
  }

  /**
   * Exemplo 2: Criar uma feature com metadata (JSON)
   */
  async createFeatureWithMetadata() {
    const feature = this.uiFeaturesRepository.create({
      key: 'dashboard.revenue.chart',
      name: 'Gráfico de Receita',
      description: 'Componente de gráfico mostrando receita mensal',
      type: UIFeatureType.COMPONENT,
      category: UIFeatureCategory.DASHBOARD,
      isVisible: true,
      isActive: true,
      displayOrder: 1,
      // Aqui você coloca qualquer JSON customizado
      metadata: {
        icon: 'bar_chart',
        color: '#4CAF50',
        chartType: 'line',
        refreshInterval: 300, // segundos
        permissions: ['view_financial'],
        customSettings: {
          showLegend: true,
          animationEnabled: true,
        },
      },
    });

    return await this.uiFeaturesRepository.save(feature);
  }

  /**
   * Exemplo 3: Criar múltiplas features de uma vez
   */
  async createMultipleFeatures() {
    const features = [
      {
        key: 'freight.list.screen',
        name: 'Tela Lista de Fretes',
        type: UIFeatureType.SCREEN,
        category: UIFeatureCategory.FREIGHT,
        isVisible: true,
        isActive: true,
        metadata: {
          route: '/freight/list',
          icon: 'list_alt',
        },
      },
      {
        key: 'freight.export.button',
        name: 'Botão Exportar',
        type: UIFeatureType.BUTTON,
        category: UIFeatureCategory.FREIGHT,
        isVisible: false, // Oculto por padrão
        isActive: true,
        parentKey: 'freight.list.screen', // Referência à tela pai
        metadata: {
          icon: 'download',
          tooltip: 'Exportar fretes para Excel',
        },
      },
      {
        key: 'freight.tracking.component',
        name: 'Rastreamento em Tempo Real',
        type: UIFeatureType.COMPONENT,
        category: UIFeatureCategory.FREIGHT,
        isVisible: false, // Feature premium
        isActive: true,
        metadata: {
          requiresIntegration: 'google_maps',
          pricing: 'premium',
        },
      },
    ];

    const createdFeatures = this.uiFeaturesRepository.create(features);
    return await this.uiFeaturesRepository.save(createdFeatures);
  }

  /**
   * Exemplo 4: Buscar features visíveis de uma categoria
   */
  async getVisibleFeaturesByCategory(category: UIFeatureCategory) {
    return await this.uiFeaturesRepository.find({
      where: {
        category,
        isVisible: true,
        isActive: true,
      },
      order: {
        displayOrder: 'ASC',
      },
    });
  }

  /**
   * Exemplo 5: Buscar uma feature específica pelo key
   */
  async getFeatureByKey(key: string) {
    return await this.uiFeaturesRepository.findOne({
      where: { key },
    });
  }

  /**
   * Exemplo 6: Atualizar visibilidade de uma feature
   */
  async updateFeatureVisibility(key: string, isVisible: boolean) {
    const feature = await this.getFeatureByKey(key);
    
    if (!feature) {
      throw new Error(`Feature ${key} não encontrada`);
    }

    feature.isVisible = isVisible;
    return await this.uiFeaturesRepository.save(feature);
  }

  /**
   * Exemplo 7: Atualizar metadata de uma feature
   */
  async updateFeatureMetadata(key: string, newMetadata: any) {
    const feature = await this.getFeatureByKey(key);
    
    if (!feature) {
      throw new Error(`Feature ${key} não encontrada`);
    }

    // Mesclar metadata existente com o novo
    feature.metadata = {
      ...feature.metadata,
      ...newMetadata,
    };

    return await this.uiFeaturesRepository.save(feature);
  }

  /**
   * Exemplo 8: Listar todas as features com filtros
   */
  async getAllFeatures(filters?: {
    type?: UIFeatureType;
    category?: UIFeatureCategory;
    isVisible?: boolean;
    isActive?: boolean;
    parentKey?: string;
  }) {
    const queryBuilder = this.uiFeaturesRepository.createQueryBuilder('feature');

    if (filters?.type) {
      queryBuilder.andWhere('feature.type = :type', { type: filters.type });
    }

    if (filters?.category) {
      queryBuilder.andWhere('feature.category = :category', {
        category: filters.category,
      });
    }

    if (filters?.isVisible !== undefined) {
      queryBuilder.andWhere('feature.isVisible = :isVisible', {
        isVisible: filters.isVisible,
      });
    }

    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('feature.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    if (filters?.parentKey) {
      queryBuilder.andWhere('feature.parentKey = :parentKey', {
        parentKey: filters.parentKey,
      });
    }

    queryBuilder.orderBy('feature.displayOrder', 'ASC');

    return await queryBuilder.getMany();
  }

  /**
   * Exemplo 9: Criar feature hierarchy (tela -> botões -> componentes)
   */
  async createFeatureHierarchy() {
    // 1. Criar tela principal
    const screen = await this.uiFeaturesRepository.save(
      this.uiFeaturesRepository.create({
        key: 'dashboard.main',
        name: 'Dashboard Principal',
        type: UIFeatureType.SCREEN,
        category: UIFeatureCategory.DASHBOARD,
        isVisible: true,
        isActive: true,
        metadata: {
          route: '/dashboard',
          icon: 'dashboard',
        },
      }),
    );

    // 2. Criar botões da tela
    const buttons = await this.uiFeaturesRepository.save([
      this.uiFeaturesRepository.create({
        key: 'dashboard.main.refresh.button',
        name: 'Botão Atualizar',
        type: UIFeatureType.BUTTON,
        category: UIFeatureCategory.DASHBOARD,
        parentKey: 'dashboard.main',
        isVisible: true,
        isActive: true,
        metadata: { icon: 'refresh' },
      }),
      this.uiFeaturesRepository.create({
        key: 'dashboard.main.export.button',
        name: 'Botão Exportar',
        type: UIFeatureType.BUTTON,
        category: UIFeatureCategory.DASHBOARD,
        parentKey: 'dashboard.main',
        isVisible: false, // Premium
        isActive: true,
        metadata: { icon: 'download', premium: true },
      }),
    ]);

    // 3. Criar componentes da tela
    const components = await this.uiFeaturesRepository.save([
      this.uiFeaturesRepository.create({
        key: 'dashboard.main.stats.component',
        name: 'Cards de Estatísticas',
        type: UIFeatureType.COMPONENT,
        category: UIFeatureCategory.DASHBOARD,
        parentKey: 'dashboard.main',
        isVisible: true,
        isActive: true,
        displayOrder: 1,
      }),
      this.uiFeaturesRepository.create({
        key: 'dashboard.main.chart.component',
        name: 'Gráfico de Performance',
        type: UIFeatureType.COMPONENT,
        category: UIFeatureCategory.DASHBOARD,
        parentKey: 'dashboard.main',
        isVisible: false, // Premium
        isActive: true,
        displayOrder: 2,
        metadata: {
          chartType: 'line',
          premium: true,
        },
      }),
    ]);

    return { screen, buttons, components };
  }

  /**
   * Exemplo 10: Seed inicial - criar todas as features do sistema
   */
  async seedInitialFeatures() {
    const features = [
      // ===== TELAS =====
      {
        key: 'freight.list',
        name: 'Lista de Fretes',
        type: UIFeatureType.SCREEN,
        category: UIFeatureCategory.FREIGHT,
        isVisible: true,
        isActive: true,
        displayOrder: 1,
        metadata: { route: '/freight', icon: 'local_shipping' },
      },
      {
        key: 'freight.create',
        name: 'Criar Frete',
        type: UIFeatureType.SCREEN,
        category: UIFeatureCategory.FREIGHT,
        isVisible: true,
        isActive: true,
        displayOrder: 2,
        metadata: { route: '/freight/create', icon: 'add_circle' },
      },
      {
        key: 'dashboard.analytics',
        name: 'Dashboard Analytics',
        type: UIFeatureType.SCREEN,
        category: UIFeatureCategory.DASHBOARD,
        isVisible: false, // Premium
        isActive: true,
        displayOrder: 1,
        metadata: { route: '/dashboard/analytics', icon: 'analytics', premium: true },
      },
      
      // ===== BOTÕES =====
      {
        key: 'freight.list.export.button',
        name: 'Exportar Fretes',
        type: UIFeatureType.BUTTON,
        category: UIFeatureCategory.FREIGHT,
        parentKey: 'freight.list',
        isVisible: false, // Premium
        isActive: true,
        metadata: { icon: 'download', tooltip: 'Exportar para Excel', premium: true },
      },
      {
        key: 'freight.list.filter.button',
        name: 'Filtros Avançados',
        type: UIFeatureType.BUTTON,
        category: UIFeatureCategory.FREIGHT,
        parentKey: 'freight.list',
        isVisible: true,
        isActive: true,
        metadata: { icon: 'filter_list' },
      },
      
      // ===== COMPONENTES =====
      {
        key: 'freight.tracking.map',
        name: 'Mapa de Rastreamento',
        type: UIFeatureType.COMPONENT,
        category: UIFeatureCategory.FREIGHT,
        isVisible: false, // Premium
        isActive: true,
        metadata: { requiresIntegration: 'google_maps', premium: true },
      },
      {
        key: 'dashboard.revenue.chart',
        name: 'Gráfico de Receita',
        type: UIFeatureType.COMPONENT,
        category: UIFeatureCategory.DASHBOARD,
        parentKey: 'dashboard.analytics',
        isVisible: false, // Premium
        isActive: true,
        metadata: { chartType: 'bar', premium: true },
      },
    ];

    const createdFeatures = this.uiFeaturesRepository.create(features);
    return await this.uiFeaturesRepository.save(createdFeatures);
  }
}

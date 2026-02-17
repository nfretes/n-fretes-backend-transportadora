import { UIFeature } from 'src/entities/ui-features.entity';
import { UIFeatureType, UIFeatureCategory } from 'src/enum/ui-feature';

/**
 * Exemplos de como cadastrar features de UI no sistema
 * Você pode usar isso em uma migration ou seed
 */
export const uiFeaturesExamples: Partial<UIFeature>[] = [
  // ========== TELAS ==========
  {
    key: 'dashboard.analytics',
    name: 'Dashboard Analytics',
    description: 'Tela principal de analytics e gráficos',
    type: UIFeatureType.SCREEN,
    category: UIFeatureCategory.DASHBOARD,
    displayOrder: 1,
    metadata: {
      icon: 'analytics',
      route: '/dashboard/analytics',
    },
  },
  {
    key: 'freight.list',
    name: 'Lista de Fretes',
    description: 'Tela com listagem de todos os fretes',
    type: UIFeatureType.SCREEN,
    category: UIFeatureCategory.FREIGHT,
    displayOrder: 1,
    metadata: {
      icon: 'list',
      route: '/freight/list',
    },
  },
  {
    key: 'freight.create',
    name: 'Criar Frete',
    description: 'Tela para criação de novo frete',
    type: UIFeatureType.SCREEN,
    category: UIFeatureCategory.FREIGHT,
     // Premium
    displayOrder: 2,
    metadata: {
      icon: 'add',
      route: '/freight/create',
    },
  },
  {
    key: 'reports.financial',
    name: 'Relatórios Financeiros',
    description: 'Tela de relatórios e análises financeiras',
    type: UIFeatureType.SCREEN,
    category: UIFeatureCategory.FINANCIAL,
     // Premium
    displayOrder: 1,
    metadata: {
      icon: 'attach_money',
      route: '/reports/financial',
    },
  },

  // ========== BOTÕES ==========
  {
    key: 'freight.create.button',
    name: 'Botão Criar Frete',
    description: 'Botão para abrir formulário de novo frete',
    type: UIFeatureType.BUTTON,
    category: UIFeatureCategory.FREIGHT,
    
    displayOrder: 1,
    metadata: {
      icon: 'add_circle',
      color: 'primary',
      tooltipText: 'Criar novo frete',
    },
  },
  {
    key: 'freight.export.button',
    name: 'Botão Exportar Fretes',
    description: 'Botão para exportar fretes em Excel/PDF',
    type: UIFeatureType.BUTTON,
    category: UIFeatureCategory.FREIGHT,
     
    displayOrder: 2,
    metadata: {
      icon: 'download',
      color: 'secondary',
    },
  },
  {
    key: 'freight.duplicate.button',
    name: 'Botão Duplicar Frete',
    description: 'Botão para duplicar um frete existente',
    type: UIFeatureType.BUTTON,
    category: UIFeatureCategory.FREIGHT,
    
    displayOrder: 3,
  },

  // ========== COMPONENTES ==========
  {
    key: 'dashboard.revenue.chart',
    name: 'Gráfico de Receita',
    description: 'Componente que exibe gráfico de receita no dashboard',
    type: UIFeatureType.COMPONENT,
    category: UIFeatureCategory.DASHBOARD,
     // Premium
    displayOrder: 1,
  },
  {
    key: 'freight.tracking.map',
    name: 'Mapa de Rastreamento',
    description: 'Componente de mapa para rastreamento de fretes',
    type: UIFeatureType.COMPONENT,
    category: UIFeatureCategory.FREIGHT,
     // Premium
    displayOrder: 1,
    metadata: {
      requiresIntegration: 'google_maps',
    },
  },
  {
    key: 'freight.price.calculator',
    name: 'Calculadora de Preço',
    description: 'Componente para cálculo automático de preço do frete',
    type: UIFeatureType.COMPONENT,
    category: UIFeatureCategory.FREIGHT,
    displayOrder: 2,
  },

  // ========== TABS ==========
  {
    key: 'freight.details.tab.history',
    name: 'Aba Histórico',
    description: 'Aba de histórico de alterações do frete',
    type: UIFeatureType.TAB,
    category: UIFeatureCategory.FREIGHT,
     // Premium
    displayOrder: 3,
  },
  {
    key: 'freight.details.tab.documents',
    name: 'Aba Documentos',
    description: 'Aba para upload e visualização de documentos',
    type: UIFeatureType.TAB,
    category: UIFeatureCategory.FREIGHT,
    
    displayOrder: 4,
  },

  // ========== MENU ITEMS ==========
  {
    key: 'menu.integrations',
    name: 'Menu Integrações',
    description: 'Item de menu para acessar integrações',
    type: UIFeatureType.MENU_ITEM,
    category: UIFeatureCategory.INTEGRATIONS,
     // Premium
    displayOrder: 5,
    metadata: {
      icon: 'extension',
      route: '/integrations',
    },
  },
  {
    key: 'menu.analytics',
    name: 'Menu Analytics',
    description: 'Item de menu para acessar analytics avançado',
    type: UIFeatureType.MENU_ITEM,
    category: UIFeatureCategory.ANALYTICS,
     // Premium
    displayOrder: 6,
    metadata: {
      icon: 'insights',
      route: '/analytics',
    },
  },

  // ========== SECTIONS ==========
  {
    key: 'settings.advanced.section',
    name: 'Configurações Avançadas',
    description: 'Seção de configurações avançadas',
    type: UIFeatureType.SECTION,
    category: UIFeatureCategory.SETTINGS,
     // Premium
    displayOrder: 1,
  },
];

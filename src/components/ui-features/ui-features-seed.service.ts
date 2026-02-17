import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UIFeature } from 'src/entities/ui-features.entity';
import { UIFeatureType, UIFeatureCategory } from 'src/enum/ui-feature';

@Injectable()
export class UIFeaturesSeedService {
  constructor(
    @InjectRepository(UIFeature)
    private readonly uiFeaturesRepository: Repository<UIFeature>,
  ) {}

  /**
   * SEED COMPLETO - Cadastra todas as páginas do seu App Mobile
   * Baseado no App.tsx fornecido
   */
  async seedMobileAppPages() {
    const features = [
      // ========== PÁGINAS PRINCIPAIS ==========
      {
        key: 'page.home',
        name: 'Home',
        description: 'Página inicial do aplicativo',
        type: UIFeatureType.SCREEN,
        category: UIFeatureCategory.DASHBOARD,
        isVisible: true,
        isActive: true,
        displayOrder: 1,
        metadata: {
          route: '/home',
          icon: 'home',
          component: 'HomePage',
          showInBottomNav: true,
        },
      },
      {
        key: 'page.search',
        name: 'Buscar Fretes',
        description: 'Página de busca de fretes',
        type: UIFeatureType.SCREEN,
        category: UIFeatureCategory.FREIGHT,
        isVisible: true,
        isActive: true,
        displayOrder: 2,
        metadata: {
          route: '/search',
          icon: 'search',
          component: 'SearchPage',
          showInBottomNav: true,
        },
      },
      {
        key: 'page.my_freights',
        name: 'Meus Fretes',
        description: 'Página com lista de fretes do motorista',
        type: UIFeatureType.SCREEN,
        category: UIFeatureCategory.FREIGHT,
        isVisible: true,
        isActive: true,
        displayOrder: 3,
        metadata: {
          route: '/my-freights',
          icon: 'local_shipping',
          component: 'MyFreightsPage',
          showInBottomNav: true,
        },
      },
      {
        key: 'page.settings',
        name: 'Configurações',
        description: 'Página de configurações do usuário',
        type: UIFeatureType.SCREEN,
        category: UIFeatureCategory.SETTINGS,
        isVisible: true,
        isActive: true,
        displayOrder: 4,
        metadata: {
          route: '/settings',
          icon: 'settings',
          component: 'SettingsPage',
          showInBottomNav: true,
        },
      },

      // ========== PÁGINAS DE DETALHES ==========
      {
        key: 'page.freight_details',
        name: 'Detalhes do Frete',
        description: 'Página de detalhes de um frete específico',
        type: UIFeatureType.SCREEN,
        category: UIFeatureCategory.FREIGHT,
        isVisible: true,
        isActive: true,
        displayOrder: 10,
        metadata: {
          route: '/freight/details',
          icon: 'description',
          component: 'FreightDetailsPage',
          requiresSelection: true,
        },
      },
      {
        key: 'page.pending_freight_details',
        name: 'Detalhes Frete Pendente',
        description: 'Página de detalhes de frete com status pendente',
        type: UIFeatureType.SCREEN,
        category: UIFeatureCategory.FREIGHT,
        isVisible: true,
        isActive: true,
        displayOrder: 11,
        metadata: {
          route: '/freight/pending-details',
          component: 'PendingFreightDetailsPage',
          freightStatus: 'PENDING',
        },
      },
      {
        key: 'page.active_freight_details',
        name: 'Detalhes Frete Ativo',
        description: 'Página de detalhes de frete em andamento',
        type: UIFeatureType.SCREEN,
        category: UIFeatureCategory.FREIGHT,
        isVisible: true,
        isActive: true,
        displayOrder: 12,
        metadata: {
          route: '/freight/active-details',
          component: 'ActiveFreightDetailsPage',
          freightStatus: 'ACTIVE',
        },
      },
      {
        key: 'page.completed_freight_details',
        name: 'Detalhes Frete Finalizado',
        description: 'Página de detalhes de frete concluído',
        type: UIFeatureType.SCREEN,
        category: UIFeatureCategory.FREIGHT,
        isVisible: true,
        isActive: true,
        displayOrder: 13,
        metadata: {
          route: '/freight/completed-details',
          component: 'CompletedFreightDetailsPage',
          freightStatus: 'COMPLETED',
        },
      },
      {
        key: 'page.carrier_profile',
        name: 'Perfil da Transportadora',
        description: 'Página com informações da transportadora',
        type: UIFeatureType.SCREEN,
        category: UIFeatureCategory.COMPANY,
        isVisible: true,
        isActive: true,
        displayOrder: 14,
        metadata: {
          route: '/carrier/profile',
          component: 'CarrierProfilePage',
          icon: 'business',
        },
      },

      // ========== PÁGINAS DE PERFIL/USUÁRIO ==========
      {
        key: 'page.profile_completion',
        name: 'Completar Perfil',
        description: 'Página para completar cadastro do motorista',
        type: UIFeatureType.SCREEN,
        category: UIFeatureCategory.USERS,
        isVisible: true,
        isActive: true,
        displayOrder: 20,
        parentKey: 'page.settings',
        metadata: {
          route: '/profile/completion',
          component: 'ProfileCompletionPage',
          icon: 'person_add',
        },
      },
      {
        key: 'page.my_data',
        name: 'Meus Dados',
        description: 'Página para editar dados pessoais',
        type: UIFeatureType.SCREEN,
        category: UIFeatureCategory.USERS,
        isVisible: true,
        isActive: true,
        displayOrder: 21,
        parentKey: 'page.settings',
        metadata: {
          route: '/profile/my-data',
          component: 'MyDataPage',
          icon: 'badge',
        },
      },
      {
        key: 'page.vehicles',
        name: 'Meus Veículos',
        description: 'Página para gerenciar veículos cadastrados',
        type: UIFeatureType.SCREEN,
        category: UIFeatureCategory.USERS,
        isVisible: true,
        isActive: true,
        displayOrder: 22,
        parentKey: 'page.settings',
        metadata: {
          route: '/vehicles',
          component: 'VehiclesPage',
          icon: 'directions_car',
        },
      },
      {
        key: 'page.change_password',
        name: 'Alterar Senha',
        description: 'Página para trocar senha',
        type: UIFeatureType.SCREEN,
        category: UIFeatureCategory.USERS,
        isVisible: true,
        isActive: true,
        displayOrder: 23,
        parentKey: 'page.settings',
        metadata: {
          route: '/profile/change-password',
          component: 'ChangePasswordPage',
          icon: 'lock',
        },
      },

      // ========== PÁGINAS DE FAVORITOS ==========
      {
        key: 'page.favorites',
        name: 'Favoritos',
        description: 'Página com fretes/transportadoras favoritas',
        type: UIFeatureType.SCREEN,
        category: UIFeatureCategory.FREIGHT,
        isVisible: true,
        isActive: true,
        displayOrder: 30,
        metadata: {
          route: '/favorites',
          component: 'FavoritesPage',
          icon: 'favorite',
        },
      },
      {
        key: 'page.favorites_destinations',
        name: 'Destinos Favoritos',
        description: 'Página com destinos favoritos do motorista',
        type: UIFeatureType.SCREEN,
        category: UIFeatureCategory.FREIGHT,
        isVisible: true,
        isActive: true,
        displayOrder: 31,
        metadata: {
          route: '/favorites/destinations',
          component: 'FavoritesDestinationsPage',
          icon: 'place',
        },
      },

      // ========== OUTRAS PÁGINAS ==========
      {
        key: 'page.notifications',
        name: 'Notificações',
        description: 'Página de notificações do app',
        type: UIFeatureType.SCREEN,
        category: UIFeatureCategory.NOTIFICATIONS,
        isVisible: true,
        isActive: true,
        displayOrder: 40,
        metadata: {
          route: '/notifications',
          component: 'NotificationsPage',
          icon: 'notifications',
        },
      },
      {
        key: 'page.ai_assistant',
        name: 'Assistente IA',
        description: 'Página do assistente virtual inteligente',
        type: UIFeatureType.SCREEN,
        category: UIFeatureCategory.ANALYTICS,
        isVisible: true,
        isActive: true,
        displayOrder: 41,
        metadata: {
          route: '/ai-assistant',
          component: 'AIAssistantPage',
          icon: 'smart_toy',
          premium: false, // Pode mudar para true se for premium
        },
      },

      // ========== PÁGINAS DE SISTEMA/DEBUG ==========
      {
        key: 'page.ui_design_system',
        name: 'Design System',
        description: 'Página de demonstração do design system',
        type: UIFeatureType.SCREEN,
        category: UIFeatureCategory.SETTINGS,
        isVisible: true, // Mude para false em produção
        isActive: true,
        displayOrder: 90,
        parentKey: 'page.settings',
        metadata: {
          route: '/ui-design-system',
          component: 'UIDesignSystemPage',
          icon: 'palette',
          developerOnly: true,
        },
      },
      {
        key: 'page.system_status',
        name: 'Status do Sistema',
        description: 'Página com informações técnicas do app',
        type: UIFeatureType.SCREEN,
        category: UIFeatureCategory.SETTINGS,
        isVisible: true,
        isActive: true,
        displayOrder: 91,
        parentKey: 'page.settings',
        metadata: {
          route: '/system-status',
          component: 'SystemStatusPage',
          icon: 'info',
        },
      },

      // ========== PÁGINAS DE AUTENTICAÇÃO (normalmente ocultas para usuários logados) ==========
      {
        key: 'page.welcome',
        name: 'Bem-vindo',
        description: 'Tela de boas-vindas inicial',
        type: UIFeatureType.SCREEN,
        category: UIFeatureCategory.USERS,
        isVisible: true,
        isActive: true,
        displayOrder: 100,
        metadata: {
          route: '/welcome',
          component: 'WelcomeScreen',
          publicPage: true,
        },
      },
      {
        key: 'page.auth',
        name: 'Login/Registro',
        description: 'Página de autenticação',
        type: UIFeatureType.SCREEN,
        category: UIFeatureCategory.USERS,
        isVisible: true,
        isActive: true,
        displayOrder: 101,
        metadata: {
          route: '/auth',
          component: 'AuthPage',
          publicPage: true,
        },
      },
      {
        key: 'page.forgot_password',
        name: 'Esqueci a Senha',
        description: 'Página para recuperação de senha',
        type: UIFeatureType.SCREEN,
        category: UIFeatureCategory.USERS,
        isVisible: true,
        isActive: true,
        displayOrder: 102,
        metadata: {
          route: '/forgot-password',
          component: 'ForgotPasswordPage',
          publicPage: true,
        },
      },
      {
        key: 'page.reset_password',
        name: 'Redefinir Senha',
        description: 'Página para criar nova senha',
        type: UIFeatureType.SCREEN,
        category: UIFeatureCategory.USERS,
        isVisible: true,
        isActive: true,
        displayOrder: 103,
        metadata: {
          route: '/reset-password',
          component: 'ResetPasswordPage',
          publicPage: true,
        },
      },
    ];

    // Limpar features existentes (opcional - comente se não quiser limpar)
    // await this.uiFeaturesRepository.delete({});

    // Criar todas as features
    const createdFeatures = this.uiFeaturesRepository.create(features);
    const saved = await this.uiFeaturesRepository.save(createdFeatures);

    return {
      message: 'Seed executado com sucesso',
      totalCreated: saved.length,
      features: saved,
    };
  }

  /**
   * Retorna apenas páginas visíveis e ativas
   */
  async getVisiblePages() {
    return await this.uiFeaturesRepository.find({
      where: {
        type: UIFeatureType.SCREEN,
        isVisible: true,
        isActive: true,
      },
      order: {
        displayOrder: 'ASC',
      },
    });
  }

  /**
   * Ocultar páginas de desenvolvimento em produção
   */
  async hideDevPages() {
    await this.uiFeaturesRepository.update(
      {
        key: 'page.ui_design_system',
      },
      {
        isVisible: false,
      },
    );

    return { message: 'Páginas de desenvolvimento ocultadas' };
  }
}

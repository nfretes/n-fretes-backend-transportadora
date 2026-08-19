# 🚀 Como Usar o Sistema de UI Features

## 1️⃣ Cadastrar TODAS as páginas do app (primeira vez)

### Endpoint:
```
POST http://localhost:3000/ui-features/seed/mobile-app
```

### Resposta:
```json
{
  "message": "Seed executado com sucesso",
  "totalCreated": 23,
  "features": [...]
}
```

Isso vai criar **23 páginas** do seu app, todas com `isVisible: true`

---

## 2️⃣ Listar todas as páginas visíveis

### Endpoint:
```
GET http://localhost:3000/ui-features/pages/visible
```

### Resposta:
```json
[
  {
    "id": "uuid...",
    "key": "page.home",
    "name": "Home",
    "type": "SCREEN",
    "category": "DASHBOARD",
    "isVisible": true,
    "isActive": true,
    "metadata": {
      "route": "/home",
      "icon": "home",
      "component": "HomePage"
    }
  },
  ...
]
```

---

## 3️⃣ Ocultar uma página específica

### Endpoint:
```
PATCH http://localhost:3000/ui-features/page.ui_design_system/visibility
```

### Body:
```json
{
  "isVisible": false
}
```

---

## 4️⃣ Buscar uma página específica

### Endpoint:
```
GET http://localhost:3000/ui-features/page.home
```

---

## 5️⃣ Ocultar páginas de desenvolvimento (produção)

### Endpoint:
```
POST http://localhost:3000/ui-features/hide-dev-pages
```

Isso vai ocultar automaticamente:
- `page.ui_design_system`

---

## 📱 Como usar no Frontend (React Native)

### 1. Criar um hook para buscar features:

```typescript
// hooks/useUIFeatures.ts
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export const useUIFeatures = () => {
  return useQuery({
    queryKey: ['ui-features'],
    queryFn: async () => {
      const { data } = await api.get('/ui-features/pages/visible');
      return data;
    },
    staleTime: 1000 * 60 * 10, // Cache por 10 minutos
  });
};

export const useIsPageVisible = (pageKey: string) => {
  const { data: features } = useUIFeatures();
  return features?.find((f) => f.key === pageKey)?.isVisible ?? true;
};
```

### 2. Usar no seu App.tsx:

```typescript
import { useIsPageVisible } from './hooks/useUIFeatures';

const AppContent: React.FC = () => {
  const isAIAssistantVisible = useIsPageVisible('page.ai_assistant');
  const isDesignSystemVisible = useIsPageVisible('page.ui_design_system');

  const renderPage = () => {
    switch (view) {
      case "HOME":
        return <HomePage />;
      
      case "AI_ASSISTANT":
        // Se não está visível, redireciona para home
        if (!isAIAssistantVisible) {
          setView("HOME");
          return <HomePage />;
        }
        return <AIAssistantPage />;
      
      case "UI_DESIGN_SYSTEM":
        if (!isDesignSystemVisible) {
          setView("HOME");
          return <HomePage />;
        }
        return <UIDesignSystemPage />;
      
      default:
        return <HomePage />;
    }
  };
};
```

### 3. Ocultar itens do menu:

```typescript
const SettingsPage = () => {
  const isDesignSystemVisible = useIsPageVisible('page.ui_design_system');
  const isSystemStatusVisible = useIsPageVisible('page.system_status');

  return (
    <View>
      <MenuItem title="Meus Dados" onPress={() => navigate('MY_DATA')} />
      <MenuItem title="Veículos" onPress={() => navigate('VEHICLES')} />
      
      {isSystemStatusVisible && (
        <MenuItem title="Status do Sistema" onPress={() => navigate('SYSTEM_STATUS')} />
      )}
      
      {isDesignSystemVisible && (
        <MenuItem title="Design System" onPress={() => navigate('UI_DESIGN_SYSTEM')} />
      )}
    </View>
  );
};
```

---

## 🎯 Casos de Uso

### Esconder funcionalidades premium
```typescript
// No backend, marcar como premium
metadata: {
  premium: true,
  requiredPlan: 'PRO'
}

// No seed, deixar isVisible: false
isVisible: false

// Quando usuário assinar plano PRO, ativar:
PATCH /ui-features/page.ai_assistant/visibility
{ "isVisible": true }
```

### Feature Flags (liberar gradualmente)
```typescript
// Começar com isVisible: false
// Testar internamente
// Depois mudar para true quando estável
PATCH /ui-features/page.new_feature/visibility
{ "isVisible": true }
```

### Customização por cliente
Se você quiser controle por empresa específica, terá que usar a entidade `ui-feature-permissions` que criamos antes.

---

## 📋 Checklist de Implantação

- [ ] Rodar `POST /ui-features/seed/mobile-app`
- [ ] Verificar `GET /ui-features/pages/visible`
- [ ] Adicionar hook `useUIFeatures` no frontend
- [ ] Implementar verificações nos componentes
- [ ] Em produção, rodar `POST /ui-features/hide-dev-pages`
- [ ] Configurar cache no frontend (React Query)

---

## 🔧 Configuração do Módulo

Não esqueça de criar o módulo e registrar no app.module.ts:

```typescript
// ui-features.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UIFeature } from 'src/entities/ui-features.entity';
import { UIFeaturesController } from './ui-features.controller';
import { UIFeaturesService } from './ui-features.service';
import { UIFeaturesSeedService } from './ui-features-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([UIFeature])],
  controllers: [UIFeaturesController],
  providers: [UIFeaturesService, UIFeaturesSeedService],
  exports: [UIFeaturesService, UIFeaturesSeedService],
})
export class UIFeaturesModule {}
```

```typescript
// app.module.ts
import { UIFeaturesModule } from './components/ui-features/ui-features.module';

@Module({
  imports: [
    // ... outros módulos
    UIFeaturesModule,
  ],
})
export class AppModule {}
```

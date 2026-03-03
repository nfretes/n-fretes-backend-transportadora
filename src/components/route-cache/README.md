# Route Cache - Sistema de Cache de Rotas e Pedágios

## 📋 Descrição

Sistema de cache para armazenar dados de rotas calculadas, incluindo pedágios, distância, duração e consumo de combustível. O cache é válido por **20 dias** e otimiza consultas frequentes evitando recalcular rotas repetidamente.

## 🗂️ Estrutura

```
src/
├── entities/
│   └── route-cache.entity.ts          # Entidade do banco de dados
├── components/route-cache/
│   ├── dto/
│   │   ├── get-route-cache.dto.ts     # DTO para buscar cache
│   │   ├── create-update-route-cache.dto.ts  # DTO para criar/atualizar
│   │   ├── route-cache-response.dto.ts       # DTOs de resposta
│   │   └── index.ts
│   ├── route-cache.controller.ts      # Endpoints REST
│   ├── route-cache.service.ts         # Lógica de negócio
│   └── route-cache.module.ts          # Módulo NestJS
└── migrations/
    └── 1709469516000-CreateRouteCacheTable.ts  # Migration do banco
```

## 🚀 Endpoints

### 1. GET `/route-cache` - Buscar Cache

Busca dados de rota em cache. Retorna erro se o cache não existir ou estiver expirado (> 20 dias).

**Query Parameters:**
```typescript
{
  originCity: string;      // Ex: "Uberlândia, MG"
  destinationCity: string; // Ex: "São Paulo, SP"
}
```

**Response 200:**
```json
{
  "success": true,
  "tolls": [
    {
      "name": "P05 - UBERABA",
      "concessionaria": "ECO 050",
      "rodovia": "BR-050",
      "price": 15.8,
      "km": "104.900",
      "latitude": -19.18078,
      "longitude": -48.157509
    }
  ],
  "totalToll": 274.3,
  "distance": 607,
  "distanceText": "607 km",
  "duration": "05:53:42",
  "fuelConsumption": 376.34,
  "coordinates": {
    "origin": {
      "latitude": -18.91907,
      "longitude": -48.27833
    },
    "destination": {
      "latitude": -23.56287,
      "longitude": -46.65469
    },
    "tollPoints": [...]
  },
  "cachedAt": "2026-03-03T12:00:00.000Z",
  "isValid": true
}
```

**Response 404:**
```json
{
  "statusCode": 404,
  "message": "Cache não encontrado ou expirado. Calcule novamente a rota."
}
```

### 2. POST `/route-cache` - Criar Cache

Salva novos dados de rota em cache.

**Body:**
```json
{
  "originCity": "Uberlândia, MG",
  "destinationCity": "São Paulo, SP",
  "tolls": [...],
  "totalToll": 274.3,
  "distance": 607,
  "distanceText": "607 km",
  "duration": "05:53:42",
  "fuelConsumption": 376.34,
  "coordinates": {...}
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Dados de rota salvos com sucesso",
  "id": "123e4567-e89b-12d3-a456-426614174000"
}
```

### 3. PUT `/route-cache` - Atualizar Cache

Atualiza cache existente ou cria novo se não existir. Use quando o cache expirou (> 20 dias).

**Body:** Mesmo do POST

**Response 200:**
```json
{
  "success": true,
  "message": "Dados de rota atualizados com sucesso",
  "id": "123e4567-e89b-12d3-a456-426614174000"
}
```

## 💡 Fluxo de Uso Recomendado

```typescript
// 1. Tentar buscar do cache primeiro
try {
  const cachedRoute = await fetch(
    `/route-cache?originCity=Uberlândia, MG&destinationCity=São Paulo, SP`
  );
  
  if (cachedRoute.ok) {
    const data = await cachedRoute.json();
    // ✅ Usar dados do cache
    return data;
  }
} catch (error) {
  // Cache não encontrado ou expirado
}

// 2. Se não houver cache válido, calcular rota
const calculatedRoute = await calculateRoute(origin, destination);

// 3. Salvar no cache para próximas consultas
await fetch('/route-cache', {
  method: 'POST',
  body: JSON.stringify(calculatedRoute)
});

return calculatedRoute;
```

## 🗄️ Banco de Dados

### Tabela: `route_cache`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | Chave primária |
| originCity | varchar | Cidade origem (ex: "Uberlândia, MG") |
| destinationCity | varchar | Cidade destino |
| tolls | jsonb | Array de pedágios |
| totalToll | decimal(10,2) | Valor total dos pedágios |
| distance | int | Distância em km |
| distanceText | varchar | Distância formatada |
| duration | varchar | Duração da viagem |
| fuelConsumption | decimal(10,2) | Consumo de combustível |
| coordinates | jsonb | Coordenadas da rota |
| createdAt | timestamp | Data de criação |
| updatedAt | timestamp | Data de atualização |
| isValid | boolean | Se o cache é válido |

**Índices:**
- `IDX_ROUTE_CACHE_ORIGIN_DESTINATION` - Busca rápida por origem/destino
- `IDX_ROUTE_CACHE_CREATED_AT` - Limpeza de caches antigos

## ⚙️ Configuração

### Rodar Migration

```bash
npm run typeorm migration:run
```

### Reverter Migration

```bash
npm run typeorm migration:revert
```

## 🧹 Manutenção

O service possui um método para limpar caches expirados:

```typescript
// Limpar todos os caches com mais de 20 dias
const deletedCount = await routeCacheService.cleanExpiredCaches();
console.log(`${deletedCount} caches expirados removidos`);
```

Recomenda-se criar um CRON job para executar isso periodicamente.

## 📊 Vantagens

- ✅ **Performance**: Evita recalcular rotas frequentes
- ✅ **Economia**: Reduz chamadas a APIs externas de cálculo de rota
- ✅ **Confiabilidade**: Dados consistentes por até 20 dias
- ✅ **Escalabilidade**: Índices otimizados para busca rápida

## 🔄 Validação Automática

O cache é automaticamente invalidado após 20 dias. Ao buscar:
- Se `createdAt` < 20 dias: Retorna dados
- Se `createdAt` >= 20 dias: Retorna 404 (precisa recalcular)

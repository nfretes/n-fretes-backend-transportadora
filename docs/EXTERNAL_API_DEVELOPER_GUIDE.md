# API Externa N-Fretes - Guia do Desenvolvedor

**Versão:** 1.0  
**Data:** Outubro 2024  
**Público:** Desenvolvedores e Integradores

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Autenticação](#autenticação)
3. [Endpoints de Frete](#endpoints-de-frete)
4. [Estrutura de Dados](#estrutura-de-dados)
5. [Códigos de Erro](#códigos-de-erro)
6. [Exemplos de Implementação](#exemplos-de-implementação)
7. [Considerações de Segurança](#considerações-de-segurança)
8. [Suporte](#suporte)

---


### Características Principais

- **Autenticação JWT** com expiração de 30 minutos
- **Acesso completo** a todos os fretes ativos (incluindo excluídos)
- **Paginação otimizada** para grandes volumes de dados
- **Filtros flexíveis** para consultas específicas
- **Rate limiting** para garantir performance

### Base URL

```
https://api.n-fretes.com/external-api
```

---

## Autenticação

### 1. Obter Token de Acesso

**Endpoint:** `POST /auth/login`

**Headers:**
```http
Content-Type: application/json
```

**Corpo da Requisição:**
```json
{
  "email": "sua-empresa@email.com",
  "password": "sua-senha-segura"
}
```

**Resposta de Sucesso (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzYTg5N2I0My1kZWM3LTRjNmMtYTk2YS0zOGUwNjllOTBhNTYiLCJlbWFpbCI6InNhcGllbkBuZnJldGVzLmNvbS5iciIsInR5cGUiOiJleHRlcm5hbF9hcGkiLCJpYXQiOjE3Mjk5NTU4MDcsImV4cCI6MTcyOTk1NzYwN30.abc123...",
  "expires_in": 1800,
  "token_type": "Bearer"
}
```

**Resposta de Erro (401):**
```json
{
  "statusCode": 401,
  "message": "Credenciais inválidas",
  "error": "Unauthorized"
}
```

### 2. Utilizando o Token

Inclua o token no header Authorization de todas as requisições subsequentes:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Tempo de Expiração

⚠️ **IMPORTANTE:** O token expira em **30 minutos** (1800 segundos)

**Implementações recomendadas:**
- Armazene o tempo de expiração (`expires_in`)
- Renove o token automaticamente antes da expiração
- Implemente retry com nova autenticação em caso de 401

---

## Endpoints de Frete

### 1. Listar Todos os Fretes

**Endpoint:** `GET /freights`

**Headers:**
```http
Authorization: Bearer {seu_token}
```

**Parâmetros Query (opcionais):**

| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| `page` | number | 1 | Número da página |
| `limit` | number | 10 | Itens por página (máx: 100) |
| `originCity` | string | - | Filtrar por cidade origem |
| `destinyCity` | string | - | Filtrar por cidade destino |
| `specieOfLoad` | string | - | Filtrar por tipo de carga |

**Exemplo de Requisição:**
```http
GET /external-api/freights?page=1&limit=50&originCity=São Paulo&destinyCity=Rio de Janeiro
```

**Resposta de Sucesso (200):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "originCity": "São Paulo",
      "originState": "SP",
      "destinyCity": "Rio de Janeiro",
      "destinyState": "RJ",
      "dateOrigin": "2024-10-20T08:00:00.000Z",
      "dateReceiver": "2024-10-22T18:00:00.000Z",
      "typeOfLoad": "COMPLETE",
      "specieOfLoad": "GRANEL",
      "weightOfLoad": "30000",
      "valueFreight": 15000.50,
      "valueCall": "Por toneladas",
      "createdAt": "2024-10-15T10:30:00.000Z",
      "updatedAt": "2024-10-16T14:20:00.000Z",
      "product": "Soja em grãos",
      "distance": "429",
      "isActive": true,
      "openSolicitations": true,
      "isExclude": false,
      "isExcludeUserId": null
    }
  ],
  "total": 1500,
  "page": 1,
  "limit": 50,
  "totalPages": 30
}
```

### 2. Buscar Frete por ID

**Endpoint:** `GET /freights/{id}`

**Headers:**
```http
Authorization: Bearer {seu_token}
```

**Resposta de Sucesso (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "originCity": "São Paulo",
  "originState": "SP",
  "destinyCity": "Rio de Janeiro",
  "destinyState": "RJ",
  "dateOrigin": "2024-10-20T08:00:00.000Z",
  "dateReceiver": "2024-10-22T18:00:00.000Z",
  "typeOfLoad": "COMPLETE",
  "specieOfLoad": "GRANEL",
  "weightOfLoad": "30000",
  "valueFreight": 15000.50,
  "valueCall": "Por toneladas",
  "createdAt": "2024-10-15T10:30:00.000Z",
  "updatedAt": "2024-10-16T14:20:00.000Z",
  "product": "Soja em grãos",
  "distance": "429",
  "isActive": true,
  "openSolicitations": true,
  "isExclude": false,
  "isExcludeUserId": null
}
```

---

## Estrutura de Dados

### FreightDataDto

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | ID único do frete |
| `originCity` | string | Cidade de origem |
| `originState` | string | Estado de origem |
| `destinyCity` | string | Cidade de destino |
| `destinyState` | string | Estado de destino |
| `dateOrigin` | Date | Data de coleta |
| `dateReceiver` | Date | Data de entrega |
| `typeOfLoad` | string | Tipo de carregamento |
| `specieOfLoad` | string | Espécie da carga |
| `weightOfLoad` | string | Peso total da carga |
| `valueFreight` | number | Valor do frete |
| `valueCall` | string | Cálculo do valor |
| `createdAt` | Date | Data de cadastro |
| `updatedAt` | Date | Data de atualização |
| `product` | string | Produto/mercadoria |
| `distance` | string | Distância em km |
| `isActive` | boolean | Status ativo do frete |
| `openSolicitations` | boolean | Solicitações abertas |
| `isExclude` | boolean | Frete excluído (soft delete) |
| `isExcludeUserId` | string | ID do usuário que excluiu |


| Código | Descrição | Ação Recomendada |
|--------|-----------|------------------|
| 400 | Bad Request | Verificar parâmetros da requisição |
| 401 | Unauthorized | Renovar token de autenticação |
| 403 | Forbidden | Verificar permissões do usuário |
| 404 | Not Found | Verificar se ID do frete existe |
| 429 | Too Many Requests | Implementar backoff exponencial |
| 500 | Internal Server Error | Aguardar e tentar novamente |


**© 2024 N-Fretes. Todos os direitos reservados.**
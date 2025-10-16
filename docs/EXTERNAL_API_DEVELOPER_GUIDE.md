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

## Visão Geral

A API Externa N-Fretes foi desenvolvida especificamente para permitir que empresas terceiras realizem ETL (Extract, Transform, Load) dos dados de frete de forma segura e eficiente.

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

### Tipos de Carga (specieOfLoad)

- `GRANEL`
- `CARGA_SECA`
- `REFRIGERADA`
- `LIQUIDA`
- `CONTAINERS`
- `VEICULO`

### Tipos de Carregamento (typeOfLoad)

- `COMPLETE` - Carga completa
- `PARTIAL` - Carga fracionada

---

## Códigos de Erro

| Código | Descrição | Ação Recomendada |
|--------|-----------|------------------|
| 400 | Bad Request | Verificar parâmetros da requisição |
| 401 | Unauthorized | Renovar token de autenticação |
| 403 | Forbidden | Verificar permissões do usuário |
| 404 | Not Found | Verificar se ID do frete existe |
| 429 | Too Many Requests | Implementar backoff exponencial |
| 500 | Internal Server Error | Aguardar e tentar novamente |

---

## Exemplos de Implementação

### Node.js/JavaScript

```javascript
class NFretesETL {
  constructor() {
    this.baseURL = 'https://api.n-fretes.com/external-api';
    this.token = null;
    this.tokenExpiry = null;
  }

  async authenticate() {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: process.env.NFRETES_EMAIL,
        password: process.env.NFRETES_PASSWORD
      })
    });

    if (!response.ok) {
      throw new Error('Falha na autenticação');
    }

    const data = await response.json();
    this.token = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000);
    
    return data;
  }

  async isTokenValid() {
    return this.token && Date.now() < (this.tokenExpiry - 60000); // Renova 1min antes
  }

  async ensureAuthenticated() {
    if (!await this.isTokenValid()) {
      await this.authenticate();
    }
  }

  async getAllFreights() {
    await this.ensureAuthenticated();
    
    let allFreights = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await fetch(
        `${this.baseURL}/freights?page=${page}&limit=100`,
        {
          headers: { 'Authorization': `Bearer ${this.token}` }
        }
      );

      if (response.status === 401) {
        await this.authenticate();
        continue;
      }

      const data = await response.json();
      allFreights = allFreights.concat(data.data);
      
      hasMore = page < data.totalPages;
      page++;
      
      // Rate limiting - pausa entre requisições
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return allFreights;
  }

  async getFreightById(id) {
    await this.ensureAuthenticated();
    
    const response = await fetch(`${this.baseURL}/freights/${id}`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar frete ${id}: ${response.status}`);
    }

    return response.json();
  }
}

// Uso
const etl = new NFretesETL();

// Buscar todos os fretes
etl.getAllFreights()
  .then(freights => {
    console.log(`Total de fretes: ${freights.length}`);
    // Processar dados para seu sistema
  })
  .catch(console.error);
```

### Python

```python
import requests
import time
import os
from datetime import datetime, timedelta

class NFretesETL:
    def __init__(self):
        self.base_url = "https://api.n-fretes.com/external-api"
        self.token = None
        self.token_expiry = None
    
    def authenticate(self):
        url = f"{self.base_url}/auth/login"
        data = {
            "email": os.getenv("NFRETES_EMAIL"),
            "password": os.getenv("NFRETES_PASSWORD")
        }
        
        response = requests.post(url, json=data)
        response.raise_for_status()
        
        result = response.json()
        self.token = result["access_token"]
        self.token_expiry = datetime.now() + timedelta(seconds=result["expires_in"])
        
        return result
    
    def is_token_valid(self):
        return (self.token and 
                datetime.now() < (self.token_expiry - timedelta(minutes=1)))
    
    def ensure_authenticated(self):
        if not self.is_token_valid():
            self.authenticate()
    
    def get_all_freights(self):
        self.ensure_authenticated()
        
        all_freights = []
        page = 1
        
        while True:
            headers = {"Authorization": f"Bearer {self.token}"}
            url = f"{self.base_url}/freights?page={page}&limit=100"
            
            response = requests.get(url, headers=headers)
            
            if response.status_code == 401:
                self.authenticate()
                continue
            
            response.raise_for_status()
            data = response.json()
            
            all_freights.extend(data["data"])
            
            if page >= data["totalPages"]:
                break
                
            page += 1
            time.sleep(0.1)  # Rate limiting
        
        return all_freights
    
    def get_freight_by_id(self, freight_id):
        self.ensure_authenticated()
        
        headers = {"Authorization": f"Bearer {self.token}"}
        url = f"{self.base_url}/freights/{freight_id}"
        
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        return response.json()

# Uso
etl = NFretesETL()

# Buscar todos os fretes
freights = etl.get_all_freights()
print(f"Total de fretes: {len(freights)}")

# Processar dados
for freight in freights:
    print(f"Frete {freight['id']}: {freight['originCity']} -> {freight['destinyCity']}")
```

---

## Considerações de Segurança

### 1. Gerenciamento de Credenciais

- **NUNCA** hardcode credenciais no código
- Use variáveis de ambiente ou serviços de secrets
- Implemente rotação regular de senhas

### 2. Rate Limiting

- Máximo de **1000 requisições por hora**
- Implemente backoff exponencial em caso de 429
- Adicione delays entre requisições em lote

### 3. Tratamento de Erros

```javascript
// Exemplo de retry com backoff exponencial
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}
```

### 4. Monitoramento

- Monitore tempos de resposta
- Configure alertas para falhas de autenticação
- Acompanhe volumes de dados extraídos

---

## Suporte

### Contatos

- **Email Técnico:** dev@n-fretes.com
- **Documentação:** https://docs.n-fretes.com
- **Status da API:** https://status.n-fretes.com

### SLA

- **Disponibilidade:** 99.9%
- **Tempo de resposta:** < 500ms (média)
- **Suporte:** Horário comercial (8h-18h)

### Changelog

**v1.0 (Outubro 2024)**
- Lançamento inicial da API Externa
- Autenticação JWT
- Endpoints de listagem e busca de fretes
- Suporte completo a ETL

---

**© 2024 N-Fretes. Todos os direitos reservados.**
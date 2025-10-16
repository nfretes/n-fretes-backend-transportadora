# API Externa N-Fretes - Documentação para Desenvolvedores

## Visão Geral

A API Externa N-Fretes permite que empresas terceiras acessem dados de frete de forma segura através de autenticação JWT. Esta API foi projetada para fornecer acesso controlado aos dados de frete para parceiros e integrações externas.

## Autenticação

### Obter Token de Acesso

**Endpoint:** `POST /external-api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Corpo da Requisição:**
```json
{
  "email": "empresa@exemplo.com",
  "password": "senha123"
}
```

**Resposta de Sucesso (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 1800
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

### Utilizando o Token

Após obter o token, inclua-o no header Authorization de todas as requisições:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Importante:** O token expira em 30 minutos. Implemente renovação automática em sua aplicação.

## Endpoints de Frete

### Listar Fretes

**Endpoint:** `GET /external-api/freights`

**Headers:**
```
Authorization: Bearer {seu_token}
```

**Parâmetros de Query (opcionais):**
- `page` (number): Número da página (padrão: 1)
- `limit` (number): Itens por página (padrão: 10, máximo: 100)
- `status` (string): Filtrar por status (PENDING, ACCEPTED, CANCELLED, etc.)
- `minWeight` (number): Peso mínimo em kg
- `maxWeight` (number): Peso máximo em kg
- `origin` (string): Cidade de origem
- `destination` (string): Cidade de destino
- `startDate` (string): Data inicial (formato: YYYY-MM-DD)
- `endDate` (string): Data final (formato: YYYY-MM-DD)

**Exemplo de Requisição:**
```
GET /external-api/freights?page=1&limit=20&status=PENDING&origin=São Paulo&destination=Rio de Janeiro
```

**Resposta de Sucesso (200):**
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "origin": "São Paulo, SP",
      "destination": "Rio de Janeiro, RJ",
      "weight": 1500,
      "dimensions": "2.0 x 1.5 x 1.0",
      "price": 850.00,
      "status": "PENDING",
      "description": "Material de construção",
      "createdAt": "2024-01-15T10:30:00Z",
      "deliveryDate": "2024-01-20T00:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 47,
    "itemsPerPage": 10,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

### Obter Frete por ID

**Endpoint:** `GET /external-api/freights/:id`

**Headers:**
```
Authorization: Bearer {seu_token}
```

**Resposta de Sucesso (200):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "origin": "São Paulo, SP",
  "destination": "Rio de Janeiro, RJ",
  "weight": 1500,
  "dimensions": "2.0 x 1.5 x 1.0",
  "price": 850.00,
  "status": "PENDING",
  "description": "Material de construção",
  "createdAt": "2024-01-15T10:30:00Z",
  "deliveryDate": "2024-01-20T00:00:00Z",
  "distance": 429.5,
  "contact": {
    "name": "João Silva",
    "phone": "(11) 99999-9999",
    "email": "joao@exemplo.com"
  }
}
```

## Status dos Fretes

Os fretes podem ter os seguintes status:

- `PENDING`: Aguardando transportadora
- `ACCEPTED`: Aceito por transportadora
- `IN_TRANSIT`: Em trânsito
- `DELIVERED`: Entregue
- `CANCELLED`: Cancelado
- `REJECTED`: Rejeitado

## Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Token inválido ou expirado |
| 403 | Forbidden - Acesso negado |
| 404 | Not Found - Recurso não encontrado |
| 429 | Too Many Requests - Limite de taxa excedido |
| 500 | Internal Server Error - Erro interno do servidor |

## Limites de Taxa

- Máximo de 1000 requisições por hora por token
- Máximo de 100 itens por página na listagem
- Token expira em 30 minutos

## Exemplos de Código

### JavaScript/Node.js

```javascript
const axios = require('axios');

class NFretesExternalAPI {
  constructor(baseURL = 'https://api.n-fretes.com') {
    this.baseURL = baseURL;
    this.token = null;
  }

  async login(email, password) {
    try {
      const response = await axios.post(`${this.baseURL}/external-api/auth/login`, {
        email,
        password
      });
      
      this.token = response.data.access_token;
      return response.data;
    } catch (error) {
      throw new Error(`Login failed: ${error.response.data.message}`);
    }
  }

  async getFreights(filters = {}) {
    if (!this.token) {
      throw new Error('Token not found. Please login first.');
    }

    try {
      const response = await axios.get(`${this.baseURL}/external-api/freights`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        },
        params: filters
      });
      
      return response.data;
    } catch (error) {
      if (error.response.status === 401) {
        throw new Error('Token expired. Please login again.');
      }
      throw error;
    }
  }

  async getFreightById(id) {
    if (!this.token) {
      throw new Error('Token not found. Please login first.');
    }

    try {
      const response = await axios.get(`${this.baseURL}/external-api/freights/${id}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      
      return response.data;
    } catch (error) {
      if (error.response.status === 401) {
        throw new Error('Token expired. Please login again.');
      }
      throw error;
    }
  }
}

// Uso
const api = new NFretesExternalAPI();

async function example() {
  try {
    // Login
    await api.login('empresa@exemplo.com', 'senha123');
    
    // Buscar fretes
    const freights = await api.getFreights({
      status: 'PENDING',
      page: 1,
      limit: 20
    });
    
    console.log('Fretes encontrados:', freights.data.length);
    
    // Buscar frete específico
    if (freights.data.length > 0) {
      const freight = await api.getFreightById(freights.data[0].id);
      console.log('Detalhes do frete:', freight);
    }
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

example();
```

### Python

```python
import requests
import json

class NFretesExternalAPI:
    def __init__(self, base_url="https://api.n-fretes.com"):
        self.base_url = base_url
        self.token = None

    def login(self, email, password):
        url = f"{self.base_url}/external-api/auth/login"
        data = {"email": email, "password": password}
        
        response = requests.post(url, json=data)
        
        if response.status_code == 200:
            result = response.json()
            self.token = result["access_token"]
            return result
        else:
            raise Exception(f"Login failed: {response.json()['message']}")

    def get_freights(self, filters=None):
        if not self.token:
            raise Exception("Token not found. Please login first.")
        
        url = f"{self.base_url}/external-api/freights"
        headers = {"Authorization": f"Bearer {self.token}"}
        
        response = requests.get(url, headers=headers, params=filters)
        
        if response.status_code == 401:
            raise Exception("Token expired. Please login again.")
        
        return response.json()

    def get_freight_by_id(self, freight_id):
        if not self.token:
            raise Exception("Token not found. Please login first.")
        
        url = f"{self.base_url}/external-api/freights/{freight_id}"
        headers = {"Authorization": f"Bearer {self.token}"}
        
        response = requests.get(url, headers=headers)
        
        if response.status_code == 401:
            raise Exception("Token expired. Please login again.")
        
        return response.json()

# Uso
api = NFretesExternalAPI()

try:
    # Login
    api.login("empresa@exemplo.com", "senha123")
    
    # Buscar fretes
    freights = api.get_freights({
        "status": "PENDING",
        "page": 1,
        "limit": 20
    })
    
    print(f"Fretes encontrados: {len(freights['data'])}")
    
    # Buscar frete específico
    if freights["data"]:
        freight = api.get_freight_by_id(freights["data"][0]["id"])
        print(f"Detalhes do frete: {freight}")
        
except Exception as e:
    print(f"Erro: {e}")
```

## Webhook (Opcional)

Para receber notificações em tempo real sobre atualizações de fretes, você pode configurar webhooks. Entre em contato com nossa equipe técnica para configuração.

## Suporte

Para dúvidas técnicas ou problemas com a API:
- Email: dev@n-fretes.com
- Documentação completa: https://docs.n-fretes.com
- Status da API: https://status.n-fretes.com

## Versionamento

Esta é a versão 1.0 da API Externa. Futuras versões serão retrocompatíveis sempre que possível.

**Versão:** 1.0  
**Última atualização:** Janeiro 2024
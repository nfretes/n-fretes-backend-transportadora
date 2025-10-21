# SIIMP Webhook - Documentação para Desenvolvedores

Base URL: `https://staging-transport.nfretes.com.br/siimp/webhook`

## 🚚 Endpoints Disponíveis

### 1. Criar Frete
**POST** `https://staging-transport.nfretes.com.br/siimp/webhook/freight`

### 2. Listar Fretes
**GET** `https://staging-transport.nfretes.com.br/siimp/webhook/freights`

### 3. Editar Frete
**PUT** `https://staging-transport.nfretes.com.br/siimp/webhook/freight/{id}`

### 4. Excluir Frete
**DELETE** `https://staging-transport.nfretes.com.br/siimp/webhook/freight/{id}`

---

## 📝 Headers Obrigatórios (Todos os Endpoints)

```json
{
  "Content-Type": "application/json",
  "username": "seu_usuario",
  "password": "sua_senha"
}
```

---

## 🆕 1. Criar Frete

**POST** `/freight`

### 📋 Campos do JSON

#### ✅ Campos Obrigatórios

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| originCity | string | Cidade de origem | "São Paulo" |
| originState | string | Estado origem (2 letras) | "SP" |
| destinyCity | string | Cidade de destino | "Rio de Janeiro" |
| destinyState | string | Estado destino (2 letras) | "RJ" |
| dateReceiver | string | Data limite entrega (ISO 8601) | "2025-10-22T18:00:00.000Z" |
| product | string | Descrição do produto | "Soja em grãos" |
| specieOfLoad | enum | Tipo da carga | "Granel" |
| weightOfLoad | string | Peso da carga | "30000" |
| valueCall | enum | Métrica de peso | "Por toneladas" |
| vehicleTypes | string | Tipo de veículo | "Truck" |
| bodyTypes | string | Tipo de carroceria | "Graneleiro" |

#### ⚪ Campos Opcionais

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| dateOrigin | string | Data de coleta (ISO 8601) | "2025-10-20T08:00:00.000Z" |
| typeOfLoad | enum | Tipo de carregamento | "Completa" |
| lona | boolean | Necessita lona | true |
| tracker | boolean | Necessita rastreador | true |
| observation | string | Observações | "Carga frágil" |

#### ✅ Resposta de Sucesso (201)
```json
{
  "message": "Frete criado com sucesso via webhook SIIMP"
}
```

---

## 📋 2. Listar Fretes

**GET** `/freights`

### 🔍 Query Parameters (Opcionais)

| Parâmetro | Tipo | Descrição | Padrão |
|-----------|------|-----------|---------|
| page | number | Número da página | 1 |
| limit | number | Itens por página | 10 |

### 📝 Exemplo de Requisição
```bash
curl -X GET "https://staging-transport.nfretes.com.br/siimp/webhook/freights?page=1&limit=10" \
  -H "username: seu_usuario" \
  -H "password: sua_senha"
```

### ✅ Resposta de Sucesso (200)
```json
{
  "data": [
    {
      "id": "uuid-do-frete",
      "originCity": "São Paulo",
      "originState": "SP",
      "destinyCity": "Rio de Janeiro",
      "destinyState": "RJ",
      "product": "Soja em grãos",
      "specieOfLoad": "Granel",
      "weightOfLoad": "30000",
      "isActive": true,
      "createdAt": "2025-10-21T10:00:00.000Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10
}
```

---

## ✏️ 3. Editar Frete

**PUT** `/freight/{id}`

### 📝 URL Parameters

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | string | ID do frete a ser editado |

### 📋 Campos do JSON
Todos os campos são **opcionais** - envie apenas os que deseja alterar.

### 📝 Exemplo de Requisição
```bash
curl -X PUT https://staging-transport.nfretes.com.br/siimp/webhook/freight/uuid-do-frete \
  -H "Content-Type: application/json" \
  -H "username: seu_usuario" \
  -H "password: sua_senha" \
  -d '{
    "product": "Milho em grãos",
    "weightOfLoad": "25000",
    "observation": "Carga para entrega urgente"
  }'
```

### ✅ Resposta de Sucesso (200)
```json
{
  "message": "Frete atualizado com sucesso via webhook SIIMP"
}
```

---

## 🗑️ 4. Excluir Frete

**DELETE** `/freight/{id}`

### 📝 URL Parameters

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | string | ID do frete a ser excluído |

### 📝 Exemplo de Requisição
```bash
curl -X DELETE https://staging-transport.nfretes.com.br/siimp/webhook/freight/uuid-do-frete \
  -H "username: seu_usuario" \
  -H "password: sua_senha"
```

### ✅ Resposta de Sucesso (200)
```json
{
  "message": "Frete excluído com sucesso via webhook SIIMP"
}
```

---

## 📊 Valores dos Enums

### specieOfLoad (obrigatório)
"Animais", "Big Bag", "Bobina", "Caixas", "Container", "Diversos", "Fardos", "Fracionada", "Granel", "Metro cúbico", "Milheiro", "Mudanças", "Palhetes", "Passageiros", "Sacos", "Tambor", "Unidades"

### valueCall (obrigatório)
"Por toneladas", "Por quilos", "Por palhetes"

### typeOfLoad (opcional)
"Completa", "Complemento"

---

## ❌ Erros Possíveis

### 401 - Credenciais Inválidas
```json
{
  "message": "Credenciais inválidas ou integração SIIMP não ativa",
  "statusCode": 401
}
```

### 400 - Campos Obrigatórios (Criar Frete)
```json
{
  "message": "Campos obrigatórios não preenchidos",
  "statusCode": 400,
  "missingFields": ["vehicleTypes", "bodyTypes"],
  "details": "Os seguintes campos são obrigatórios: vehicleTypes, bodyTypes"
}
```

### 404 - Frete Não Encontrado (Editar/Excluir)
```json
{
  "message": "Frete não encontrado ou não pertence à empresa",
  "statusCode": 404
}
```

---

## 💻 Implementação Rápida

### JavaScript

#### Criar Frete
```javascript
const response = await fetch('https://staging-transport.nfretes.com.br/siimp/webhook/freight', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'username': 'seu_usuario',
    'password': 'sua_senha'
  },
  body: JSON.stringify({
    originCity: "São Paulo",
    originState: "SP",
    destinyCity: "Rio de Janeiro",
    destinyState: "RJ",
    dateReceiver: "2025-10-22T18:00:00.000Z",
    product: "Soja em grãos",
    specieOfLoad: "Granel",
    weightOfLoad: "30000",
    valueCall: "Por toneladas",
    vehicleTypes: "Truck",
    bodyTypes: "Graneleiro"
  })
});
const result = await response.json();
console.log(result);
```

#### Listar Fretes
```javascript
const response = await fetch('https://staging-transport.nfretes.com.br/siimp/webhook/freights?page=1&limit=10', {
  method: 'GET',
  headers: {
    'username': 'seu_usuario',
    'password': 'sua_senha'
  }
});
const result = await response.json();
console.log(result);
```

#### Editar Frete
```javascript
const response = await fetch('https://staging-transport.nfretes.com.br/siimp/webhook/freight/uuid-do-frete', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'username': 'seu_usuario',
    'password': 'sua_senha'
  },
  body: JSON.stringify({
    product: "Milho em grãos",
    weightOfLoad: "25000"
  })
});
const result = await response.json();
console.log(result);
```

#### Excluir Frete
```javascript
const response = await fetch('https://staging-transport.nfretes.com.br/siimp/webhook/freight/uuid-do-frete', {
  method: 'DELETE',
  headers: {
    'username': 'seu_usuario',
    'password': 'sua_senha'
  }
});
const result = await response.json();
console.log(result);
```

### Python

#### Criar Frete
```python
import requests

response = requests.post(
    'https://staging-transport.nfretes.com.br/siimp/webhook/freight',
    headers={
        'Content-Type': 'application/json',
        'username': 'seu_usuario',
        'password': 'sua_senha'
    },
    json={
        'originCity': "São Paulo",
        'originState': "SP",
        'destinyCity': "Rio de Janeiro",
        'destinyState': "RJ",
        'dateReceiver': "2025-10-22T18:00:00.000Z",
        'product': "Soja em grãos",
        'specieOfLoad': "Granel",
        'weightOfLoad': "30000",
        'valueCall': "Por toneladas",
        'vehicleTypes': "Truck",
        'bodyTypes': "Graneleiro"
    }
)
print(response.json())
```

#### Listar Fretes
```python
import requests

response = requests.get(
    'https://staging-transport.nfretes.com.br/siimp/webhook/freights',
    headers={
        'username': 'seu_usuario',
        'password': 'sua_senha'
    },
    params={'page': 1, 'limit': 10}
)
print(response.json())
```

#### Editar Frete
```python
import requests

response = requests.put(
    'https://staging-transport.nfretes.com.br/siimp/webhook/freight/uuid-do-frete',
    headers={
        'Content-Type': 'application/json',
        'username': 'seu_usuario',
        'password': 'sua_senha'
    },
    json={
        'product': "Milho em grãos",
        'weightOfLoad': "25000"
    }
)
print(response.json())
```

#### Excluir Frete
```python
import requests

response = requests.delete(
    'https://staging-transport.nfretes.com.br/siimp/webhook/freight/uuid-do-frete',
    headers={
        'username': 'seu_usuario',
        'password': 'sua_senha'
    }
)
print(response.json())
```

---

## 📌 Notas Importantes

1. **Autenticação**: Todos os endpoints requerem os headers `username` e `password`
2. **Soft Delete**: O endpoint DELETE não remove permanentemente, apenas marca como excluído
3. **Coordenadas**: Ao criar/editar fretes, as coordenadas e distâncias são calculadas automaticamente
4. **Paginação**: O endpoint de listagem suporta paginação via query parameters
5. **Datas**: Use formato ISO 8601 para datas (`YYYY-MM-DDTHH:mm:ss.sssZ`)
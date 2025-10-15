# SIIMP Webhook - Documentação para Desenvolvedores

## 🔗 Endpoint

```
POST https://staging-transport.nfretes.com.br/siimp/webhook/freight
```

## 🔑 Headers Obrigatórios

```json
{
  "Content-Type": "application/json",
  "username": "seu_usuario",
  "password": "sua_senha"
}
```

## 📋 Campos do JSON

### ✅ Campos Obrigatórios

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `originCity` | string | Cidade de origem | `"São Paulo"` |
| `originState` | string | Estado origem (2 letras) | `"SP"` |
| `destinyCity` | string | Cidade de destino | `"Rio de Janeiro"` |
| `destinyState` | string | Estado destino (2 letras) | `"RJ"` |
| `dateReceiver` | string | Data limite entrega (ISO 8601) | `"2025-10-22T18:00:00.000Z"` |
| `product` | string | Descrição do produto | `"Soja em grãos"` |
| `specieOfLoad` | enum | Tipo da carga | `"Granel"` |
| `weightOfLoad` | string | Peso da carga | `"30000"` |
| `valueCall` | enum | Métrica de peso | `"Por toneladas"` |
| `vehicleTypes` | string | Tipo de veículo | `"Truck"` |
| `bodyTypes` | string | Tipo de carroceria | `"Graneleiro"` |

### ❓ Campos Opcionais

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `dateOrigin` | string | Data de coleta (ISO 8601) | `"2025-10-20T08:00:00.000Z"` |
| `typeOfLoad` | enum | Tipo de carregamento | `"Completa"` |
| `lona` | boolean | Necessita lona | `true` |
| `tracker` | boolean | Necessita rastreador | `true` |
| `observation` | string | Observações | `"Carga frágil"` |

## 📝 Valores dos Enums

### `specieOfLoad` (obrigatório)
```
"Animais", "Big Bag", "Bobina", "Caixas", "Container", "Diversos", 
"Fardos", "Fracionada", "Granel", "Metro cúbico", "Milheiro", 
"Mudanças", "Palhetes", "Passageiros", "Sacos", "Tambor", "Unidades"
```

### `valueCall` (obrigatório)
```
"Por toneladas", "Por quilos", "Por palhetes"
```

### `typeOfLoad` (opcional)
```
"Completa", "Complemento"
```

## ✅ Exemplo de Requisição

```bash
curl -X POST https://staging-transport.nfretes.com.br/siimp/webhook/freight \
  -H "Content-Type: application/json" \
  -H "username: seu_usuario" \
  -H "password: sua_senha" \
  -d '{
    "originCity": "São Paulo",
    "originState": "SP",
    "destinyCity": "Rio de Janeiro",
    "destinyState": "RJ",
    "dateReceiver": "2025-10-22T18:00:00.000Z",
    "product": "Soja em grãos",
    "specieOfLoad": "Granel",
    "weightOfLoad": "30000",
    "valueCall": "Por toneladas",
    "vehicleTypes": "Truck",
    "bodyTypes": "Graneleiro"
  }'
```

## ✅ Resposta de Sucesso (201)

```json
{
  "message": "Frete criado com sucesso via webhook SIIMP"
}
```

## ❌ Erros Possíveis

### 401 - Credenciais Inválidas
```json
{
  "message": "Credenciais inválidas ou integração SIIMP não ativa",
  "statusCode": 401
}
```

### 400 - Campos Obrigatórios
```json
{
  "message": "Campos obrigatórios não preenchidos",
  "statusCode": 400,
  "missingFields": ["vehicleTypes", "bodyTypes"],
  "details": "Os seguintes campos são obrigatórios: vehicleTypes, bodyTypes"
}
```

## 🚀 Implementação Rápida

### JavaScript
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

### Python
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

## 📞 Suporte

Em caso de dúvidas, entre em contato com a equipe de desenvolvimento.
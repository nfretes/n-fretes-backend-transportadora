# Documentação da Rota ExcludeFreight

## Endpoint: DELETE /freight/:id/exclude

### Descrição
Esta rota permite excluir um frete usando soft delete. O frete não é removido fisicamente do banco de dados, mas é marcado como excluído (`isExclude = true`) e o ID do usuário que fez a exclusão é armazenado.

### Headers Obrigatórios
```
Authorization: Bearer <jwt_token>
```

### Parâmetros da URL
- `id` (string): ID do frete a ser excluído

### Exemplo de Requisição

```bash
# Usando curl
curl -X DELETE http://localhost:3000/freight/550e8400-e29b-41d4-a716-446655440000/exclude \
  -H "Authorization: Bearer seu_jwt_token_aqui"
```

```javascript
// Usando JavaScript/Fetch
const response = await fetch('/freight/550e8400-e29b-41d4-a716-446655440000/exclude', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer ' + jwtToken,
    'Content-Type': 'application/json'
  }
});

const result = await response.text();
console.log(result); // "Frete excluído com sucesso"
```

### Respostas

#### 200 - Sucesso
```
"Frete excluído com sucesso"
```

#### 404 - Frete não encontrado
```json
{
  "statusCode": 404,
  "message": "Não foi localizado um frete para exclusão"
}
```

#### 400 - Frete já excluído
```json
{
  "statusCode": 400,
  "message": "Este frete já foi excluído"
}
```

#### 401 - Token inválido ou ausente
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### Funcionalidades Implementadas

1. **Soft Delete**: O frete não é removido do banco, apenas marcado como excluído
2. **Auditoria**: Salva o ID do usuário que fez a exclusão (`isExcludeUserId`)
3. **Desativação Automática**: Marca `isActive = false` e `openSolicitations = false`
4. **Validações**: 
   - Verifica se o frete existe
   - Impede exclusão dupla do mesmo frete
5. **Transação**: Usa transação para garantir consistência dos dados

### Campos Alterados na Tabela
Quando um frete é excluído, os seguintes campos são atualizados:
- `isExclude`: `true`
- `isExcludeUserId`: ID do usuário que fez a exclusão
- `isActive`: `false`
- `openSolicitations`: `false`

### Observações
- Esta operação é irreversível via API (seria necessário acesso direto ao banco para reverter)
- O usuário deve estar autenticado com JWT válido
- A operação é executada dentro de uma transação para garantir integridade dos dados
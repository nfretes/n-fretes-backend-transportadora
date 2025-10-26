# 🚀 Guia de Deploy - Ambiente de Teste Contabo

## 📋 Passos para subir o backend no Contabo

### 1. Conectar no servidor Contabo
```bash
ssh root@147.93.178.216
```

### 2. Instalar dependências necessárias
```bash
# Atualizar sistema
apt update && apt upgrade -y

# Instalar Git
apt install git -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

### 3. Clonar o repositório
```bash
# Criar diretório para o projeto
mkdir -p /var/www
cd /var/www

# Clonar o repositório (substitua pela URL do seu repo)
git clone https://github.com/nfretes/n-fretes-backend-transportadora.git
cd n-fretes-backend-transportadora

# Mudar para a branch dev
git checkout dev
```

### 4. Configurar variáveis de ambiente
```bash
# Copiar arquivo de exemplo
cp .env.test .env

# Editar as variáveis (substitua pelos valores reais)
nano .env
```

### 5. Executar o deploy
```bash
# Dar permissão ao script
chmod +x deploy-test.sh

# Executar o deploy
./deploy-test.sh
```

### 6. Verificar se está funcionando
```bash
# Verificar containers rodando
docker ps

# Verificar logs
docker-compose -f docker-compose.test.yaml logs -f

# Testar a aplicação
curl http://localhost:3000
```

## 🔧 Comandos úteis

### Parar os serviços
```bash
docker-compose -f docker-compose.test.yaml down
```

### Reiniciar os serviços
```bash
docker-compose -f docker-compose.test.yaml restart
```

### Ver logs em tempo real
```bash
docker-compose -f docker-compose.test.yaml logs -f
```

### Acessar o container da aplicação
```bash
docker exec -it nfretes_backend_test bash
```

### Acessar o PostgreSQL
```bash
docker exec -it nfretes_postgres_test psql -U nfretes_test -d nfretes_test_db
```

## 🌐 Acessos
- **API Backend**: http://147.93.178.216:3000
- **PostgreSQL**: 147.93.178.216:5432
- **Usuário DB**: nfretes_test
- **Senha DB**: test123456
- **Nome DB**: nfretes_test_db

## 🔄 Para atualizar o código
```bash
cd /var/www/n-fretes-backend-transportadora
git pull origin dev
docker-compose -f docker-compose.test.yaml up -d --build
```

## 🚨 Troubleshooting

### Se o container não subir:
```bash
# Ver logs detalhados
docker-compose -f docker-compose.test.yaml logs

# Reconstruir tudo do zero
docker-compose -f docker-compose.test.yaml down
docker system prune -f
docker-compose -f docker-compose.test.yaml up -d --build
```

### Se o banco não conectar:
```bash
# Verificar se o PostgreSQL está rodando
docker ps | grep postgres

# Testar conexão
docker exec -it nfretes_postgres_test pg_isready -U nfretes_test
```
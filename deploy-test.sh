#!/bin/bash

# Script para deploy no ambiente de teste - Contabo
# Execute este script no servidor Contabo

echo "🚀 Iniciando deploy do ambiente de teste no Contabo..."

# Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Instalando..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "✅ Docker instalado. Faça logout e login novamente."
    exit 1
fi

# Verificar se o Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não está instalado. Instalando..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose instalado."
fi

# Parar containers existentes se houver
echo "🛑 Parando containers existentes..."
docker-compose -f docker-compose.test.yaml down

# Limpar containers e imagens antigas (opcional)
echo "🧹 Limpando recursos antigos..."
docker system prune -f

# Construir e subir os serviços
echo "🔨 Construindo e iniciando os serviços..."
docker-compose -f docker-compose.test.yaml --env-file .env.test up -d --build

# Verificar status dos containers
echo "📋 Status dos containers:"
docker-compose -f docker-compose.test.yaml ps

# Verificar logs do banco de dados
echo "📊 Logs do PostgreSQL:"
docker-compose -f docker-compose.test.yaml logs postgres-test

# Verificar logs da aplicação
echo "📊 Logs da aplicação:"
docker-compose -f docker-compose.test.yaml logs app-test

echo "✅ Deploy concluído!"
echo "🌐 Sua aplicação está rodando em: http://147.93.178.216:3000"
echo "🗄️  PostgreSQL está rodando na porta: 5432"
echo ""
echo "Para verificar os logs em tempo real:"
echo "docker-compose -f docker-compose.test.yaml logs -f"
echo ""
echo "Para parar os serviços:"
echo "docker-compose -f docker-compose.test.yaml down"
#!/bin/sh

echo "⏳ Aguardando banco de dados ficar pronto..."
sleep 5

# Injeta o SQL de seed
echo "💉 Injetando dados de exemplo no banco..."
mysql -h db -u senco_user -psenco_password senco_engenharia_db < /seed/data.sql

# Copia e renomeia imagens para garantir que batam com o banco de dados
echo "🖼️ Preparando imagens de vitrine..."

# Normaliza os arquivos de sample_data para o diretório de uploads
cp "/sample_data/2008 Suzuki hayabusa.jpg" "/app/uploads/2008-Suzuki-hayabusa.jpg" 2>/dev/null
cp "/sample_data/2013 Honda nc700.jpeg" "/app/uploads/2013-Honda-nc700.jpeg" 2>/dev/null

echo "✅ Seed concluído com sucesso!"

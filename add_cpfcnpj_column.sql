-- Adicionar coluna cpfCnpj na tabela users
-- Execute este script no seu banco de dados para adicionar a coluna necessária

ALTER TABLE `users` 
ADD COLUMN `cpfCnpj` VARCHAR(18) DEFAULT NULL 
AFTER `phone`;

-- Comentário: A coluna cpfCnpj foi adicionada para armazenar CPF ou CNPJ dos usuários
-- Tamanho VARCHAR(18) para acomodar CPF (14 caracteres com pontos e traços) ou CNPJ (18 caracteres com pontos, barras e traços)
-- DEFAULT NULL para permitir valores nulos para usuários existentes

-- Script para corrigir o banco de dados
-- Execute este script no seu banco de dados para resolver os problemas

-- 1. Adicionar coluna cpfCnpj na tabela users
ALTER TABLE `users` 
ADD COLUMN `cpfCnpj` VARCHAR(18) DEFAULT NULL 
AFTER `phone`;

-- 2. Criar tabela establishment_business_hours
CREATE TABLE `establishment_business_hours` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `establishment_id` int(11) NOT NULL,
  `day_of_week` int(11) NOT NULL COMMENT '0=Domingo, 1=Segunda, 2=Terça, 3=Quarta, 4=Quinta, 5=Sexta, 6=Sábado',
  `open_time` time NOT NULL,
  `close_time` time NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `establishment_id` (`establishment_id`),
  CONSTRAINT `establishment_business_hours_ibfk_1` FOREIGN KEY (`establishment_id`) REFERENCES `establishment_profile` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comentários:
-- 1. A coluna cpfCnpj foi adicionada para armazenar CPF ou CNPJ dos usuários
-- 2. A tabela establishment_business_hours armazena os horários detalhados de funcionamento
-- 3. day_of_week: 0=Domingo, 1=Segunda, 2=Terça, 3=Quarta, 4=Quinta, 5=Sexta, 6=Sábado
-- 4. open_time e close_time: horários de abertura e fechamento no formato HH:MM:SS 
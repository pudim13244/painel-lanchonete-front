-- Script simples para adicionar campos na tabela orders
-- Execute este script no seu banco de dados MySQL

-- Adicionar campo delivery_address
ALTER TABLE orders ADD COLUMN delivery_address TEXT DEFAULT NULL AFTER order_type;

-- Adicionar campo notes
ALTER TABLE orders ADD COLUMN notes TEXT DEFAULT NULL AFTER delivery_address;

-- Adicionar campo updated_at
ALTER TABLE orders ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- Verificar se os campos foram adicionados
DESCRIBE orders; 
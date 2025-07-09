-- Script simples para adicionar campos que podem estar faltando
-- Execute cada comando separadamente para evitar erros

-- 1. Adicionar campo notes (se não existir)
ALTER TABLE orders ADD COLUMN notes TEXT DEFAULT NULL AFTER delivery_address;

-- 2. Adicionar campo updated_at (se não existir)
ALTER TABLE orders ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- 3. Verificar se os campos foram adicionados
DESCRIBE orders; 
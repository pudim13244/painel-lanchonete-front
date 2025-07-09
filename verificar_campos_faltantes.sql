-- Script para verificar se os campos notes e updated_at existem
-- Execute este script para ver quais campos ainda precisam ser adicionados

-- Verificar estrutura atual da tabela orders
DESCRIBE orders;

-- Verificar especificamente os campos que precisamos
SELECT 
  COLUMN_NAME, 
  DATA_TYPE, 
  IS_NULLABLE, 
  COLUMN_DEFAULT,
  ORDINAL_POSITION
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'orders' 
  AND COLUMN_NAME IN ('delivery_address', 'notes', 'updated_at')
ORDER BY COLUMN_NAME;

-- Se algum campo não existir, execute os comandos abaixo:

-- Para adicionar campo notes (se não existir):
-- ALTER TABLE orders ADD COLUMN notes TEXT DEFAULT NULL AFTER delivery_address;

-- Para adicionar campo updated_at (se não existir):
-- ALTER TABLE orders ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at; 
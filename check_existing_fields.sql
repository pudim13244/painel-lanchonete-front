-- Script para verificar quais campos já existem na tabela orders
-- Execute este script para ver a estrutura atual da tabela

-- Verificar estrutura completa da tabela orders
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
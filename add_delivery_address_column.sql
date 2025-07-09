-- Script para adicionar o campo delivery_address na tabela orders
-- Este campo será usado para armazenar o endereço específico de cada pedido
-- em vez de depender do campo address da tabela users

-- Verificar se o campo já existe antes de adicionar
SET @sql = (
  SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'orders' 
     AND COLUMN_NAME = 'delivery_address') = 0,
    'ALTER TABLE orders ADD COLUMN delivery_address TEXT DEFAULT NULL AFTER order_type;',
    'SELECT "Campo delivery_address já existe na tabela orders" as message;'
  )
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar também o campo notes se não existir
SET @sql = (
  SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'orders' 
     AND COLUMN_NAME = 'notes') = 0,
    'ALTER TABLE orders ADD COLUMN notes TEXT DEFAULT NULL AFTER delivery_address;',
    'SELECT "Campo notes já existe na tabela orders" as message;'
  )
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar campo updated_at se não existir
SET @sql = (
  SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'orders' 
     AND COLUMN_NAME = 'updated_at') = 0,
    'ALTER TABLE orders ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;',
    'SELECT "Campo updated_at já existe na tabela orders" as message;'
  )
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar se os campos foram adicionados corretamente
SELECT 
  COLUMN_NAME, 
  DATA_TYPE, 
  IS_NULLABLE, 
  COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'orders' 
  AND COLUMN_NAME IN ('delivery_address', 'notes', 'updated_at')
ORDER BY COLUMN_NAME; 
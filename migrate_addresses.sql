-- Script para migrar endereços existentes da tabela users para user_address
-- Baseado no dump real do banco u328800108_food_fly

-- 1. Verificar usuários com endereços existentes
SELECT 
    id,
    name,
    phone,
    address,
    role
FROM users 
WHERE address IS NOT NULL 
  AND address != '' 
  AND address != 'LOCAL'
  AND role = 'CUSTOMER'
ORDER BY id;

-- 2. Migrar endereços existentes para a nova tabela user_address
-- Primeiro, verificar se a tabela user_address existe
SET @table_exists = (
    SELECT COUNT(*) 
    FROM information_schema.tables 
    WHERE table_schema = DATABASE() 
    AND table_name = 'user_address'
);

-- Se a tabela não existir, criar primeiro
SET @create_table_sql = IF(
    @table_exists = 0,
    'CREATE TABLE `user_address` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `user_id` int(11) NOT NULL,
        `label` varchar(100) NOT NULL,
        `address` text NOT NULL,
        `is_default` tinyint(1) NOT NULL DEFAULT 0,
        `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
        `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (`id`),
        KEY `idx_user_id` (`user_id`),
        KEY `idx_is_default` (`is_default`),
        CONSTRAINT `fk_user_address_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;',
    'SELECT "Tabela user_address já existe" as message;'
);

PREPARE stmt FROM @create_table_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Inserir endereços existentes na nova tabela
INSERT INTO user_address (user_id, label, address, is_default)
SELECT 
    id as user_id,
    'Endereço Principal' as label,
    address,
    1 as is_default
FROM users 
WHERE address IS NOT NULL 
  AND address != '' 
  AND address != 'LOCAL'
  AND role = 'CUSTOMER'
  AND id NOT IN (
    SELECT DISTINCT user_id 
    FROM user_address 
    WHERE user_id IS NOT NULL
  );

-- 4. Verificar endereços migrados
SELECT 
    ua.id,
    ua.user_id,
    u.name as user_name,
    u.phone as user_phone,
    ua.label,
    ua.address,
    ua.is_default,
    ua.created_at
FROM user_address ua
INNER JOIN users u ON ua.user_id = u.id
ORDER BY ua.user_id, ua.is_default DESC, ua.created_at;

-- 5. Contar quantos endereços foram migrados
SELECT 
    COUNT(*) as total_addresses_migrated,
    COUNT(DISTINCT user_id) as unique_users_with_addresses
FROM user_address;

-- 6. Verificar usuários que ainda não têm endereços cadastrados
SELECT 
    u.id,
    u.name,
    u.phone,
    u.address as old_address,
    CASE 
        WHEN ua.id IS NOT NULL THEN 'Tem endereço na nova tabela'
        ELSE 'Sem endereço na nova tabela'
    END as status
FROM users u
LEFT JOIN user_address ua ON u.id = ua.user_id
WHERE u.role = 'CUSTOMER'
  AND ua.id IS NULL
ORDER BY u.id;

-- 7. Limpar campo address antigo (OPCIONAL - descomente se quiser)
-- ATENÇÃO: Execute apenas após confirmar que a migração foi bem-sucedida
/*
UPDATE users 
SET address = NULL
WHERE role = 'CUSTOMER'
  AND id IN (
    SELECT user_id 
    FROM user_address 
    WHERE is_default = 1
  );
*/

-- 8. Verificar se há endereços duplicados na nova tabela
SELECT 
    user_id,
    COUNT(*) as total_addresses,
    GROUP_CONCAT(label ORDER BY id) as labels
FROM user_address
GROUP BY user_id
HAVING COUNT(*) > 1
ORDER BY total_addresses DESC; 
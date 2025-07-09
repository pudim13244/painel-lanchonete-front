-- Script para criar a tabela user_address
-- Baseado na estrutura real do banco u328800108_food_fly

-- Verificar se a tabela já existe
SET @table_exists = (
    SELECT COUNT(*) 
    FROM information_schema.tables 
    WHERE table_schema = DATABASE() 
    AND table_name = 'user_address'
);

-- Criar tabela apenas se não existir
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

-- Verificar se a tabela foi criada
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN 'Tabela user_address criada com sucesso!'
        ELSE 'Erro ao criar tabela user_address'
    END as status
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND table_name = 'user_address';

-- Mostrar estrutura da tabela
DESCRIBE user_address;

-- Inserir alguns endereços de exemplo (opcional)
-- Descomente as linhas abaixo se quiser inserir dados de teste
/*
INSERT INTO user_address (user_id, label, address, is_default) VALUES
(2, 'Casa', 'Rua Rufino Barbosa, 123', 1),
(2, 'Trabalho', 'Av. Principal, 456 - Centro', 0),
(7, 'Residência', 'Rua das Flores, 789', 1),
(19, 'Casa', 'Rua Rufino Barbosa, 321', 1),
(21, 'Residência', 'Rua das Palmeiras, 654', 1),
(25, 'Casa', 'Rua Rufino Barbosa, Casa', 1),
(26, 'Residência', 'Rua das Carmens, 987', 1),
(27, 'Casa Principal', 'Rua Rufino Barbosa, 555', 1),
(28, 'Residência', 'JOÃO BATISTA DE SOUZA, 95', 1),
(37, 'Casa', 'Rua das Avenidas, 111', 1),
(38, 'Residência', 'Waldemar da Silva 15', 1),
(39, 'Casa', 'JOÃO BATISTA DE SOUZA, 95', 1),
(40, 'Residência', 'Rua das Estrelas, 222', 1);
*/

-- Verificar dados inseridos (se houver)
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
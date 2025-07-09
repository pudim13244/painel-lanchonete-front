-- Script para encontrar usuários duplicados por número de telefone
-- Baseado no dump real do banco u328800108_food_fly
-- Execute este script para identificar e limpar duplicatas

-- 1. QUERY PRINCIPAL: Encontrar usuários duplicados por telefone
SELECT 
    phone,
    COUNT(*) as total_duplicates,
    GROUP_CONCAT(id ORDER BY id) as user_ids,
    GROUP_CONCAT(name ORDER BY id) as user_names,
    GROUP_CONCAT(role ORDER BY id) as user_roles,
    GROUP_CONCAT(email ORDER BY id) as user_emails
FROM users 
WHERE phone IS NOT NULL 
  AND phone != '' 
  AND phone != '00000000000'  -- Excluir telefones de consumo local
  AND role = 'CUSTOMER'       -- Apenas clientes
GROUP BY phone 
HAVING COUNT(*) > 1
ORDER BY total_duplicates DESC, phone;

-- 2. QUERY DETALHADA: Ver detalhes completos de cada usuário duplicado
SELECT 
    u.id,
    u.name,
    u.email,
    u.phone,
    u.role,
    u.address,
    u.status,
    COUNT(o.id) as total_orders,
    SUM(CASE WHEN o.status = 'DELIVERED' THEN 1 ELSE 0 END) as orders_delivered,
    SUM(CASE WHEN o.status = 'CANCELLED' THEN 1 ELSE 0 END) as orders_cancelled,
    SUM(CASE WHEN o.status IN ('PENDING', 'PREPARING', 'READY', 'DELIVERING') THEN 1 ELSE 0 END) as orders_active
FROM users u
LEFT JOIN orders o ON u.id = o.customer_id
WHERE u.phone IN (
    SELECT phone 
    FROM users 
    WHERE phone IS NOT NULL 
      AND phone != '' 
      AND phone != '00000000000'
      AND role = 'CUSTOMER'
    GROUP BY phone 
    HAVING COUNT(*) > 1
)
  AND u.role = 'CUSTOMER'
ORDER BY u.phone, u.id;

-- 3. QUERY PARA VERIFICAR PEDIDOS DE USUÁRIOS DUPLICADOS
SELECT 
    u.phone,
    u.id as user_id,
    u.name as user_name,
    o.id as order_id,
    o.status as order_status,
    o.total_amount,
    o.created_at as order_date,
    o.delivery_address
FROM users u
INNER JOIN orders o ON u.id = o.customer_id
WHERE u.phone IN (
    SELECT phone 
    FROM users 
    WHERE phone IS NOT NULL 
      AND phone != '' 
      AND phone != '00000000000'
      AND role = 'CUSTOMER'
    GROUP BY phone 
    HAVING COUNT(*) > 1
)
  AND u.role = 'CUSTOMER'
ORDER BY u.phone, u.id, o.created_at DESC;

-- 4. QUERY PARA EXCLUIR USUÁRIOS DUPLICADOS (MANTER APENAS O MAIS ANTIGO)
-- ATENÇÃO: Execute apenas após revisar os resultados acima
-- Esta query mantém o usuário com ID menor (mais antigo) e exclui os demais
/*
DELETE u1 FROM users u1
INNER JOIN users u2 
WHERE u1.phone = u2.phone 
  AND u1.id > u2.id
  AND u1.role = 'CUSTOMER'
  AND u2.role = 'CUSTOMER'
  AND u1.phone IS NOT NULL 
  AND u1.phone != '' 
  AND u1.phone != '00000000000';
*/

-- 5. QUERY PARA VERIFICAR USUÁRIOS SEM TELEFONE
SELECT 
    id,
    name,
    email,
    phone,
    role,
    status
FROM users 
WHERE (phone IS NULL OR phone = '' OR phone = '00000000000')
  AND role = 'CUSTOMER'
ORDER BY id;

-- 6. QUERY PARA VERIFICAR TELEFONES INVÁLIDOS
SELECT 
    id,
    name,
    email,
    phone,
    role,
    status
FROM users 
WHERE phone IS NOT NULL 
  AND phone != '' 
  AND phone != '00000000000'
  AND phone NOT REGEXP '^[0-9()\\-\\s]+$'  -- Verifica se contém apenas números, parênteses, hífens e espaços
  AND role = 'CUSTOMER'
ORDER BY phone;

-- 7. QUERY PARA NORMALIZAR TELEFONES (remover caracteres especiais)
-- ATENÇÃO: Execute apenas após revisar os resultados
/*
UPDATE users 
SET phone = REGEXP_REPLACE(phone, '[^0-9]', '')
WHERE phone IS NOT NULL 
  AND phone != '' 
  AND phone != '00000000000'
  AND role = 'CUSTOMER';
*/ 
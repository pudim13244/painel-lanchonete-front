-- Verificar se o campo only_linked_delivery existe na tabela
DESCRIBE establishment_profile;

-- Verificar os dados atuais do campo only_linked_delivery
SELECT id, user_id, restaurant_name, only_linked_delivery 
FROM establishment_profile 
LIMIT 5;

-- Verificar se há algum registro com only_linked_delivery = 1
SELECT COUNT(*) as total_com_restricao 
FROM establishment_profile 
WHERE only_linked_delivery = 1; 
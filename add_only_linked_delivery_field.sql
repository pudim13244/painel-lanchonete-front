-- Adicionar campo only_linked_delivery à tabela establishment_profile
ALTER TABLE establishment_profile 
ADD COLUMN only_linked_delivery TINYINT(1) DEFAULT 0 
AFTER whatsapp;

-- Comentário explicativo
-- Este campo controla se o estabelecimento aceita apenas entregadores vinculados
-- 0 = false (aceita qualquer entregador)
-- 1 = true (aceita apenas entregadores vinculados) 
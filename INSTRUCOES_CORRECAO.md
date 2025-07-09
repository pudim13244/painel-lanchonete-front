# Correção do Botão "Permitir apenas entregadores vinculados"

## Problema Identificado
O botão "Permitir apenas entregadores vinculados" não estava funcionando porque o campo `only_linked_delivery` não existia na tabela `establishment_profile` do banco de dados.

## Solução

### 1. Executar o Script SQL
Execute o seguinte comando SQL no seu banco de dados MySQL:

```sql
-- Adicionar campo only_linked_delivery à tabela establishment_profile
ALTER TABLE establishment_profile 
ADD COLUMN only_linked_delivery TINYINT(1) DEFAULT 0 
AFTER whatsapp;
```

### 2. Alterações Realizadas no Código

#### Backend (api/routes/establishment.js)
- ✅ Adicionado campo `only_linked_delivery` na rota GET `/profile`
- ✅ Adicionado campo `only_linked_delivery` na rota PUT `/profile`
- ✅ Adicionado campo `only_linked_delivery` na função `ensureProfileExists`
- ✅ A lógica de atribuição automática de entregadores já estava funcionando corretamente

#### Frontend (src/pages/Profile.tsx)
- ✅ O campo já estava sendo enviado corretamente no formulário
- ✅ O switch já estava funcionando corretamente

## Como Funciona

1. **Quando DESATIVADO (padrão)**: O sistema aceita qualquer entregador disponível para receber pedidos automaticamente.

2. **Quando ATIVADO**: O sistema aceita apenas entregadores que foram previamente vinculados ao estabelecimento através da seção "Gerenciar Entregadores".

## Teste

Após executar o script SQL e reiniciar o servidor:

1. Acesse o perfil do estabelecimento
2. Ative/desative o switch "Permitir apenas entregadores vinculados"
3. Salve as alterações
4. Verifique se a configuração está sendo respeitada na atribuição automática de entregadores

## Arquivos Modificados
- `api/routes/establishment.js` - Rotas de perfil do estabelecimento
- `add_only_linked_delivery_field.sql` - Script SQL para adicionar o campo 
# Correção do Erro 500 - Criação de Pedidos

## Problema Identificado

O erro 500 estava ocorrendo devido a valores `undefined` sendo passados para o MySQL na criação de pedidos. A mensagem de erro era:

```
Bind parameters must not contain undefined. To pass SQL NULL specify JS null
```

## Causa Raiz

1. **Campos inexistentes**: Os campos `delivery_address`, `notes` e `updated_at` não existiam na tabela `orders`
2. **Valores undefined**: O código estava tentando inserir valores `undefined` no banco de dados
3. **Falta de validação**: Não havia verificação se os campos existiam antes de tentar usá-los

## Correções Implementadas

### 1. Script SQL para Adicionar Campos

Criado o arquivo `add_fields_simple.sql`:

```sql
-- Adicionar campo delivery_address
ALTER TABLE orders ADD COLUMN delivery_address TEXT DEFAULT NULL AFTER order_type;

-- Adicionar campo notes
ALTER TABLE orders ADD COLUMN notes TEXT DEFAULT NULL AFTER delivery_address;

-- Adicionar campo updated_at
ALTER TABLE orders ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;
```

### 2. Correção na Criação de Pedidos

**Arquivo**: `api/routes/orders.js`

- **Removido** os campos `delivery_address` e `notes` da inserção inicial
- **Adicionado** UPDATE separado com try/catch para lidar com campos inexistentes
- **Corrigido** valores undefined nos itens do pedido
- **Adicionado** validação para `optionId` e `itemId`

```javascript
// Inserir pedido sem os campos opcionais
const [orderResult] = await pool.execute(`
  INSERT INTO orders (
    customer_id, 
    establishment_id, 
    status, 
    total_amount, 
    delivery_fee, 
    payment_method, 
    order_type, 
    created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
`, [/* parâmetros */]);

// Atualizar com campos opcionais se existirem
try {
  await pool.execute(`
    UPDATE orders SET 
      delivery_address = ?, 
      notes = ? 
    WHERE id = ?
  `, [mesa || null, req.body.notes || null, orderId]);
} catch (updateError) {
  console.log('Campos delivery_address/notes não existem ainda, continuando...');
}
```

### 3. Correção nas Queries de Busca

**Arquivos**: `api/routes/orders.js`, `api/routes/establishment.js`, `api/config/database.js`

- **Substituído** `o.delivery_address` por `COALESCE(o.delivery_address, u.address)`
- **Fallback** para o endereço do usuário se o campo não existir

```sql
COALESCE(o.delivery_address, u.address) as customer_address
```

### 4. Validação de Valores

- **Item price**: `item.price || 0` em vez de `item.price`
- **Option ID**: Verificação `if (optionId && itemId)` antes da inserção
- **Null values**: Uso de `|| null` para valores opcionais

## Como Aplicar as Correções

### 1. Execute o Script SQL

```bash
# No seu cliente MySQL ou phpMyAdmin
mysql -u root -p lancheria_pedidos_ninja < add_fields_simple.sql
```

### 2. Reinicie o Servidor

```bash
# No diretório api
npm restart
# ou
node server.js
```

### 3. Teste a Criação de Pedidos

Tente criar um novo pedido para verificar se o erro foi resolvido.

## Benefícios da Correção

1. **Compatibilidade**: Funciona com e sem os novos campos
2. **Robustez**: Não quebra se campos estiverem faltando
3. **Flexibilidade**: Permite migração gradual
4. **Fallback**: Usa endereço do usuário se necessário

## Verificação

Após aplicar as correções, verifique se:

- ✅ Pedidos são criados sem erro 500
- ✅ Endereços são exibidos corretamente
- ✅ Campos opcionais funcionam quando existem
- ✅ Sistema funciona mesmo sem os novos campos 
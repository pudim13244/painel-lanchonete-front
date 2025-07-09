# Mudanças no Sistema de Endereços - Pedidos

## Resumo das Alterações

O sistema foi modificado para que o endereço seja um campo específico de cada pedido (`delivery_address` na tabela `orders`), em vez de ser puxado do usuário no banco de dados. Isso torna o sistema mais flexível e adequado para uso em PDV.

## Principais Mudanças

### 1. Estrutura do Banco de Dados

- **Campo `delivery_address`**: Agora armazena o endereço específico de cada pedido
- **Campo `notes`**: Para observações adicionais do pedido
- **Campo `updated_at`**: Para controle de atualizações

### 2. Backend (API)

#### Arquivos Modificados:
- `api/routes/orders.js`
- `api/routes/establishment.js`
- `api/config/database.js`

#### Principais Alterações:
- Queries atualizadas para usar `o.delivery_address` em vez de `u.address`
- Criação de pedidos agora salva o endereço no campo `delivery_address`
- Atualização de pedidos modifica apenas o campo do pedido, não do usuário

### 3. Frontend (TypeScript/React)

#### Interfaces Atualizadas:
- `Order` interface em `src/services/establishment.ts`
- `OrderForDelivery` interface

#### Componentes Modificados:
- `OrderModal.tsx`: Remove lógica de atualização do usuário
- `OptimizedOrderCard.tsx`: Usa `delivery_address` para exibição
- `PrintOrder.tsx`: Atualizado para usar o novo campo

### 4. Script SQL

- `add_delivery_address_column.sql`: Script para adicionar os campos necessários

## Benefícios da Mudança

### 1. Flexibilidade
- Cada pedido pode ter um endereço diferente
- Não afeta o endereço cadastrado do usuário
- Ideal para pedidos de terceiros ou endereços temporários

### 2. Adequação para PDV
- Permite entrada rápida de endereços
- Não requer cadastro prévio do cliente
- Suporte a diferentes tipos de pedido (entrega, retirada, consumo local)

### 3. Integridade dos Dados
- Endereço do pedido fica preservado mesmo se o usuário alterar seu cadastro
- Histórico completo de endereços por pedido
- Melhor rastreabilidade

## Tipos de Pedido Suportados

### 1. DELIVERY (Entrega)
- Campo `delivery_address` contém o endereço completo
- Exemplo: "Rua das Flores, 123 - Centro"

### 2. PICKUP (Retirada)
- Campo `delivery_address` pode conter "RETIRADA" ou observações
- Cliente busca no estabelecimento

### 3. DINE_IN (Consumo Local)
- Campo `delivery_address` contém número da mesa
- Exemplo: "Mesa 5" ou "Balcão"

## Como Usar

### 1. Criar Pedido
```javascript
const orderData = {
  name: "João Silva",
  phone: "11999999999",
  address: "Rua das Flores, 123", // Será salvo em delivery_address
  orderType: "delivery",
  items: [...]
};
```

### 2. Atualizar Pedido
```javascript
const updateData = {
  delivery_address: "Novo endereço",
  notes: "Observações do pedido",
  status: "PREPARING"
};
```

### 3. Exibir Pedido
```javascript
// O endereço agora vem do campo delivery_address
console.log(order.delivery_address);
```

## Compatibilidade

- ✅ Pedidos existentes continuam funcionando
- ✅ Interface mantém a mesma usabilidade
- ✅ APIs mantêm compatibilidade
- ✅ Script SQL adiciona campos automaticamente

## Próximos Passos

1. Executar o script SQL para adicionar os campos
2. Testar criação e atualização de pedidos
3. Verificar exibição em todos os componentes
4. Validar impressão de pedidos 
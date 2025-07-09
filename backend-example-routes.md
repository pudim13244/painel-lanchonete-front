# Rotas do Backend para Pedidos do Estabelecimento

## 1. Buscar Pedidos do Estabelecimento

```javascript
// GET /api/establishment/orders
// Query params: status (opcional)

app.get('/api/establishment/orders', authenticateToken, async (req, res) => {
  try {
    const establishmentId = req.user.id; // ID do estabelecimento logado
    const { status } = req.query;
    
    let query = `
      SELECT 
        o.*,
        u.name as customer_name,
        u.phone as customer_phone,
        u.address as customer_address,
        d.name as delivery_person_name
      FROM orders o
      LEFT JOIN users u ON o.customer_id = u.id
      LEFT JOIN users d ON o.delivery_id = d.id
      WHERE o.establishment_id = ?
    `;
    
    const params = [establishmentId];
    
    if (status && status !== 'all') {
      query += ' AND o.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY o.created_at DESC';
    
    const [orders] = await db.execute(query, params);
    
    // Buscar itens de cada pedido
    for (let order of orders) {
      const [items] = await db.execute(`
        SELECT 
          oi.*,
          p.name as product_name
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [order.id]);
      
      // Buscar adicionais de cada item
      for (let item of items) {
        const [additions] = await db.execute(`
          SELECT 
            oia.*,
            opt.name
          FROM order_item_acrescimo oia
          LEFT JOIN options opt ON oia.acrescimo_id = opt.id
          WHERE oia.order_item_id = ?
        `, [item.id]);
        
        item.additions = additions;
      }
      
      order.items = items;
    }
    
    res.json(orders);
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});
```

## 2. Buscar Detalhes de um Pedido Específico

```javascript
// GET /api/establishment/orders/:id

app.get('/api/establishment/orders/:id', authenticateToken, async (req, res) => {
  try {
    const establishmentId = req.user.id;
    const orderId = req.params.id;
    
    // Verificar se o pedido pertence ao estabelecimento
    const [order] = await db.execute(`
      SELECT 
        o.*,
        u.name as customer_name,
        u.phone as customer_phone,
        u.address as customer_address,
        d.name as delivery_person_name
      FROM orders o
      LEFT JOIN users u ON o.customer_id = u.id
      LEFT JOIN users d ON o.delivery_id = d.id
      WHERE o.id = ? AND o.establishment_id = ?
    `, [orderId, establishmentId]);
    
    if (order.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    
    // Buscar itens do pedido
    const [items] = await db.execute(`
      SELECT 
        oi.*,
        p.name as product_name
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [orderId]);
    
    // Buscar adicionais de cada item
    for (let item of items) {
      const [additions] = await db.execute(`
        SELECT 
          oia.*,
          opt.name
        FROM order_item_acrescimo oia
        LEFT JOIN options opt ON oia.acrescimo_id = opt.id
        WHERE oia.order_item_id = ?
      `, [item.id]);
      
      item.additions = additions;
    }
    
    order[0].items = items;
    
    res.json(order[0]);
  } catch (error) {
    console.error('Erro ao buscar detalhes do pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});
```

## 3. Atualizar Status de um Pedido

```javascript
// PUT /api/establishment/orders/:id/status

app.put('/api/establishment/orders/:id/status', authenticateToken, async (req, res) => {
  try {
    const establishmentId = req.user.id;
    const orderId = req.params.id;
    const { status } = req.body;
    
    // Validar status
    const validStatuses = ['PENDING', 'PREPARING', 'READY', 'DELIVERING', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }
    
    // Verificar se o pedido pertence ao estabelecimento
    const [order] = await db.execute(`
      SELECT id FROM orders 
      WHERE id = ? AND establishment_id = ?
    `, [orderId, establishmentId]);
    
    if (order.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    
    // Atualizar status
    await db.execute(`
      UPDATE orders SET status = ? WHERE id = ?
    `, [status, orderId]);
    
    // Buscar pedido atualizado
    const [updatedOrder] = await db.execute(`
      SELECT 
        o.*,
        u.name as customer_name,
        u.phone as customer_phone,
        u.address as customer_address,
        d.name as delivery_person_name
      FROM orders o
      LEFT JOIN users u ON o.customer_id = u.id
      LEFT JOIN users d ON o.delivery_id = d.id
      WHERE o.id = ?
    `, [orderId]);
    
    // Buscar itens do pedido
    const [items] = await db.execute(`
      SELECT 
        oi.*,
        p.name as product_name
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [orderId]);
    
    // Buscar adicionais de cada item
    for (let item of items) {
      const [additions] = await db.execute(`
        SELECT 
          oia.*,
          opt.name
        FROM order_item_acrescimo oia
        LEFT JOIN options opt ON oia.acrescimo_id = opt.id
        WHERE oia.order_item_id = ?
      `, [item.id]);
      
      item.additions = additions;
    }
    
    updatedOrder[0].items = items;
    
    res.json(updatedOrder[0]);
  } catch (error) {
    console.error('Erro ao atualizar status do pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});
```

## 4. Middleware de Autenticação

```javascript
// middleware/auth.js

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token de acesso necessário' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    
    // Verificar se o usuário é um estabelecimento
    if (user.role !== 'ESTABLISHMENT') {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    
    req.user = user;
    next();
  });
};
```

## 5. Estrutura de Resposta Esperada

O frontend espera receber dados no seguinte formato:

```json
[
  {
    "id": 123,
    "customer_id": 456,
    "establishment_id": 789,
    "delivery_id": 101,
    "status": "PENDING",
    "total_amount": 45.90,
    "delivery_fee": 5.00,
    "payment_method": "PIX",
    "order_type": "DELIVERY",
    "amount_paid": null,
    "change_amount": null,
    "payment_status": "PENDING",
    "created_at": "2025-01-19T10:30:00.000Z",
    "customer_name": "João Silva",
    "customer_phone": "(11) 99999-9999",
    "customer_address": "Rua das Flores, 123",
    "delivery_person_name": "Carlos Entregador",
    "items": [
      {
        "id": 1,
        "product_id": 10,
        "quantity": 2,
        "price": 15.90,
        "obs": "Sem cebola",
        "product_name": "X-Burguer Especial",
        "additions": [
          {
            "id": 1,
            "name": "Bacon Extra",
            "quantity": 1,
            "price": 3.00
          }
        ]
      }
    ]
  }
]
```

## 6. Configuração do CORS (se necessário)

```javascript
// app.js ou server.js

const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173', // URL do frontend
  credentials: true
}));
```

## 7. Tratamento de Erros

```javascript
// middleware/errorHandler.js

app.use((error, req, res, next) => {
  console.error('Erro:', error);
  
  if (error.code === 'ER_NO_SUCH_TABLE') {
    return res.status(500).json({ error: 'Erro na estrutura do banco de dados' });
  }
  
  if (error.code === 'ER_ACCESS_DENIED_ERROR') {
    return res.status(500).json({ error: 'Erro de acesso ao banco de dados' });
  }
  
  res.status(500).json({ error: 'Erro interno do servidor' });
});
```

## Resumo

O frontend agora está configurado para:

1. ✅ Buscar pedidos do estabelecimento logado
2. ✅ Filtrar pedidos por status
3. ✅ Visualizar detalhes completos de cada pedido
4. ✅ Atualizar status dos pedidos
5. ✅ Exibir informações do cliente, entregador e itens
6. ✅ Mostrar adicionais e observações
7. ✅ Atualizar a lista em tempo real

O backend precisa implementar as 3 rotas principais:
- `GET /api/establishment/orders` - Listar pedidos
- `GET /api/establishment/orders/:id` - Detalhes do pedido
- `PUT /api/establishment/orders/:id/status` - Atualizar status 
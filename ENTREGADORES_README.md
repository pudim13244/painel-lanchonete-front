# Página de Entregadores Vinculados

## Visão Geral

A página de entregadores vinculados permite que estabelecimentos gerenciem os entregadores que trabalham para eles. Esta funcionalidade é essencial para estabelecimentos que desejam ter controle total sobre quem faz as entregas dos seus pedidos.

## Funcionalidades

### 1. Vincular Entregador
- **Como usar**: Digite o e-mail do entregador no campo e clique em "Vincular"
- **Requisitos**: O entregador deve ter uma conta cadastrada no sistema com perfil de entregador
- **Resultado**: O entregador será vinculado ao estabelecimento e aparecerá na lista

### 2. Visualizar Entregadores Vinculados
- **Informações exibidas**:
  - Nome do entregador
  - E-mail e telefone
  - Tipo e modelo do veículo
  - Status de disponibilidade
  - Número de pedidos ativos
  - Se é o entregador prioritário

### 3. Definir Entregador Prioritário
- **Como usar**: Clique em "Definir Prioritário" no card do entregador
- **Funcionalidade**: Define o entregador como prioritário (será o primeiro a receber pedidos)
- **Limitação**: Apenas um entregador pode ser prioritário por estabelecimento

### 4. Desvincular Entregador
- **Como usar**: Clique em "Desvincular" no card do entregador
- **Confirmação**: O sistema pedirá confirmação antes de desvincular
- **Restrição**: Não é possível desvincular entregadores com pedidos ativos

## Status dos Entregadores

### Indicadores Visuais
- **🟢 Disponível**: Entregador sem pedidos ativos
- **🟡 Ocupado**: Entregador com 1-2 pedidos ativos
- **🔴 Indisponível**: Entregador com 3 ou mais pedidos ativos

### Entregador Prioritário
- **Identificação**: Estrela dourada ao lado do nome
- **Destaque**: Card com borda verde e fundo verde claro
- **Função**: Recebe prioridade na atribuição automática de pedidos

## Integração com Pedidos

### Atribuição Automática
- O sistema pode atribuir pedidos automaticamente aos entregadores vinculados
- O entregador prioritário tem preferência
- Entregadores com menos pedidos ativos são priorizados

### Configuração do Estabelecimento
- **Apenas entregadores vinculados**: Ativa para usar apenas entregadores vinculados
- **Qualquer entregador**: Permite usar qualquer entregador disponível

## Rotas da API

### Backend (Node.js)
```javascript
// Listar entregadores vinculados
GET /api/establishment/delivery-people

// Vincular entregador
POST /api/establishment/delivery-people/link
Body: { email: "entregador@email.com" }

// Definir entregador prioritário
POST /api/establishment/delivery-people/set-priority
Body: { delivery_id: 123 }

// Desvincular entregador
DELETE /api/establishment/delivery-people/:deliveryId
```

### Frontend (React/TypeScript)
```typescript
// Interface do entregador
interface DeliveryPerson {
  id: number;
  name: string;
  email: string;
  phone: string;
  vehicle_type: string;
  vehicle_model: string;
  is_default: boolean;
  active_orders: number;
  is_available: boolean;
  apply_fee: boolean;
}
```

## Estrutura do Banco de Dados

### Tabela `establishment_delivery`
```sql
CREATE TABLE establishment_delivery (
  id INT PRIMARY KEY AUTO_INCREMENT,
  establishment_id INT NOT NULL,
  delivery_id INT NOT NULL,
  is_default TINYINT(1) DEFAULT 0,
  apply_fee TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (establishment_id) REFERENCES users(id),
  FOREIGN KEY (delivery_id) REFERENCES users(id)
);
```

## Melhorias Implementadas

### Interface do Usuário
- ✅ Design moderno com cards responsivos
- ✅ Indicadores visuais de status
- ✅ Ícones intuitivos
- ✅ Estados de loading e erro
- ✅ Confirmações para ações destrutivas

### Funcionalidades
- ✅ Vinculação por e-mail
- ✅ Definição de entregador prioritário
- ✅ Desvinculação com validações
- ✅ Contagem de pedidos ativos
- ✅ Verificação de disponibilidade

### Backend
- ✅ Rotas completas para CRUD
- ✅ Validações de segurança
- ✅ Verificação de pedidos ativos
- ✅ Tratamento de erros
- ✅ Logs detalhados

## Próximos Passos

### Funcionalidades Futuras
- [ ] Histórico de entregas por entregador
- [ ] Relatórios de performance
- [ ] Configuração de taxas por entregador
- [ ] Notificações em tempo real
- [ ] Geolocalização dos entregadores

### Melhorias Técnicas
- [ ] Cache de dados dos entregadores
- [ ] Paginação para muitos entregadores
- [ ] Filtros e busca
- [ ] Exportação de dados
- [ ] Integração com mapas

## Troubleshooting

### Problemas Comuns

1. **Erro ao vincular entregador**
   - Verifique se o e-mail está correto
   - Confirme se o usuário tem perfil de entregador
   - Verifique se já não está vinculado

2. **Entregador não aparece na lista**
   - Verifique se o vínculo foi criado corretamente
   - Confirme se o usuário tem role "DELIVERY"

3. **Erro ao desvincular**
   - Verifique se o entregador não tem pedidos ativos
   - Confirme se o vínculo existe

### Logs Úteis
```javascript
// Verificar entregadores vinculados
SELECT * FROM establishment_delivery WHERE establishment_id = ?;

// Verificar pedidos ativos
SELECT * FROM orders WHERE delivery_id = ? AND status IN ('READY', 'DELIVERING');

// Verificar usuários entregadores
SELECT * FROM users WHERE role = 'DELIVERY';
``` 
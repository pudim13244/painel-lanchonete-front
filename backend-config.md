# Configuração do Backend - QuickPainel

## Visão Geral

Este documento descreve a configuração e estrutura do backend do sistema QuickPainel, desenvolvido em Node.js com Express e MySQL.

## Estrutura do Projeto

```
api/
├── config/
│   └── database.js          # Configuração do banco de dados
├── routes/
│   ├── auth.js              # Rotas de autenticação
│   ├── users.js             # Rotas de usuários
│   ├── products.js          # Rotas de produtos
│   ├── orders.js            # Rotas de pedidos
│   ├── categories.js        # Rotas de categorias
│   ├── establishment.js     # Rotas do estabelecimento
│   ├── establishments.js    # Rotas de estabelecimentos
│   ├── acrescimos.js        # Rotas de acréscimos
│   ├── option-groups.js     # Rotas de grupos de opções
│   └── options.js           # Rotas de opções
├── middleware/
│   ├── auth.js              # Middleware de autenticação
│   └── validation.js        # Middleware de validação
├── utils/
│   └── database.js          # Utilitários do banco
├── app.js                   # Configuração do Express
├── server.js                # Servidor principal
├── start.js                 # Script de inicialização
└── package.json             # Dependências
```

## Configuração do Banco de Dados

### Variáveis de Ambiente

Crie um arquivo `.env` na pasta `api/` com as seguintes variáveis:

```env
# Configurações do Banco de Dados
DB_HOST=srv1074.hstgr.io
DB_USER=u328800108_food
DB_PASSWORD=Vit@r1324
DB_NAME=u328800108_food_fly

# Configurações JWT
JWT_SECRET=quickdeliver_secret_key_2024

# Configurações do Servidor
PORT=3001
NODE_ENV=development

# Configurações de Segurança
CORS_ORIGIN=http://localhost:8080
```

### Estrutura das Tabelas

O sistema utiliza as seguintes tabelas principais:

- `users` - Usuários do sistema (clientes, estabelecimentos, entregadores)
- `products` - Produtos do cardápio
- `categories` - Categorias de produtos
- `orders` - Pedidos realizados
- `order_items` - Itens dos pedidos
- `establishments` - Informações dos estabelecimentos
- `acrescimos` - Acréscimos/adicionais
- `option_groups` - Grupos de opções
- `options` - Opções disponíveis

## Instalação e Execução

### 1. Instalar Dependências

```bash
cd api
npm install
```

### 2. Configurar Variáveis de Ambiente

```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

### 3. Iniciar o Servidor

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

### 4. Verificar Status

```bash
# Testar conexão com banco
npm run test:db

# Verificar status do sistema
node check-system-status.js
```

## Rotas da API

### Autenticação
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/register` - Registro de usuário
- `GET /api/auth/me` - Obter dados do usuário logado

### Usuários
- `GET /api/users` - Listar usuários
- `GET /api/users/:id` - Obter usuário específico
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário

### Produtos
- `GET /api/products` - Listar produtos
- `POST /api/products` - Criar produto
- `PUT /api/products/:id` - Atualizar produto
- `DELETE /api/products/:id` - Deletar produto

### Pedidos
- `GET /api/orders` - Listar pedidos
- `POST /api/orders` - Criar pedido
- `PUT /api/orders/:id` - Atualizar pedido
- `GET /api/orders/:id` - Obter pedido específico

### Estabelecimento
- `GET /api/establishment/dashboard` - Dashboard do estabelecimento
- `GET /api/establishment/profile` - Perfil do estabelecimento
- `PUT /api/establishment/profile` - Atualizar perfil

## Segurança

### Middleware de Autenticação

Todas as rotas protegidas utilizam o middleware de autenticação que:

1. Verifica se o token JWT está presente
2. Valida o token
3. Adiciona os dados do usuário ao request
4. Redireciona para login se não autenticado

### Validação de Dados

O sistema utiliza `express-validator` para:

- Validar entrada de dados
- Sanitizar dados
- Prevenir SQL injection
- Garantir integridade dos dados

### Headers de Segurança

Utiliza `helmet` para adicionar headers de segurança:

- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection

## WebSocket

O sistema inclui suporte a WebSocket para:

- Atualizações em tempo real de pedidos
- Notificações de status
- Comunicação bidirecional cliente-servidor

## Logs e Monitoramento

### Logs de Desenvolvimento

```bash
# Ver logs do servidor
npm run dev

# Ver logs específicos
node check-system-status.js
```

### Logs de Produção

```bash
# Logs de erro
npm start 2>&1 | tee error.log

# Logs completos
npm start 2>&1 | tee app.log
```

## Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco**
   - Verificar variáveis de ambiente
   - Testar conexão: `npm run test:db`

2. **Erro de CORS**
   - Verificar `CORS_ORIGIN` no `.env`
   - Verificar se o frontend está na porta correta

3. **Erro de autenticação**
   - Verificar `JWT_SECRET` no `.env`
   - Verificar se o token está sendo enviado corretamente

4. **Erro de porta em uso**
   - Verificar se a porta 3001 está livre
   - Alterar `PORT` no `.env` se necessário

### Comandos Úteis

```bash
# Verificar status do sistema
node check-system-status.js

# Testar conexão com banco
npm run test:db

# Debug de variáveis de ambiente
node debug-env.js

# Verificar dependências
npm audit
``` 
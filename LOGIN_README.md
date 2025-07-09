# Sistema de Login - QuickPainel

## Visão Geral

Este sistema de login foi implementado para conectar com o banco de dados existente do projeto QuickPainel. O sistema suporta três tipos de usuários:

### Tipos de Usuário

1. **CUSTOMER** - Clientes que fazem pedidos
2. **ESTABLISHMENT** - Estabelecimentos/restaurantes que gerenciam pedidos
3. **DELIVERY** - Entregadores que realizam as entregas

### Estrutura do Banco de Dados

A tabela `users` possui os seguintes campos relevantes:
- `id` - ID único do usuário
- `name` - Nome completo
- `email` - Email (usado para login)
- `password` - Senha criptografada
- `role` - Tipo de usuário (CUSTOMER, ESTABLISHMENT, DELIVERY)
- `phone` - Telefone (opcional)
- `address` - Endereço (opcional)

### Funcionalidades Implementadas

#### Autenticação
- ✅ Login com email e senha
- ✅ Validação de credenciais
- ✅ Geração de token JWT
- ✅ Verificação de token em rotas protegidas
- ✅ Logout com limpeza de dados

#### Controle de Acesso
- ✅ Rotas protegidas por tipo de usuário
- ✅ Redirecionamento automático baseado no role
- ✅ Middleware de autenticação
- ✅ Contexto de autenticação no React

#### Interface
- ✅ Página de login responsiva
- ✅ Validação de formulário
- ✅ Mensagens de erro
- ✅ Loading states
- ✅ Redirecionamento automático após login

### Credenciais de Teste

#### Estabelecimento
- **Email:** manoelvitor253@gmail.com
- **Senha:** 12345678

#### Cliente
- **Email:** cliente@teste.com
- **Senha:** 12345678

#### Entregador
- **Email:** entregador@teste.com
- **Senha:** 12345678

### Como Usar

1. **Iniciar o sistema:**
   ```bash
   # Terminal 1 - Backend
   cd api
   npm start
   
   # Terminal 2 - Frontend
   npm run dev
   ```

2. **Acessar o sistema:**
   - Abra: http://localhost:8080
   - Use uma das credenciais acima
   - O sistema redirecionará automaticamente baseado no tipo de usuário

3. **Funcionalidades por tipo:**
   - **ESTABLISHMENT:** Dashboard, pedidos, entregadores
   - **CUSTOMER:** Cardápio, pedidos, perfil
   - **DELIVERY:** Pedidos disponíveis, entregas

### Tecnologias Utilizadas

- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, MySQL
- **Autenticação:** JWT (JSON Web Tokens)
- **Criptografia:** bcryptjs
- **Validação:** express-validator

### Estrutura de Arquivos

```
src/
├── contexts/
│   └── AuthContext.tsx          # Contexto de autenticação
├── components/
│   └── ProtectedRoute.tsx       # Componente de rota protegida
├── services/
│   └── auth.ts                  # Serviços de autenticação
└── pages/
    └── Login.tsx                # Página de login
```

### Segurança

- ✅ Senhas criptografadas com bcrypt
- ✅ Tokens JWT com expiração
- ✅ Validação de entrada
- ✅ Proteção contra SQL injection
- ✅ Headers de segurança com helmet

## Configuração do Banco de Dados

### Dados de Conexão
- **Host**: `srv1074.hstgr.io`
- **Usuário**: `u328800108_food`
- **Senha**: `Vit@r1324`
- **Banco**: `u328800108_food_fly`
- **JWT Secret**: `quickdeliver_secret_key_2024`
- **Porta**: `3001`

### Dados de Teste Disponíveis

#### Clientes (CUSTOMER)
- Email: `cliente17991288208@clientedelivery.com`
- Email: `cli17997548917@fake.com`
- Email: `cli18996564808@fake.com`

#### Estabelecimentos (ESTABLISHMENT)
- Email: `manoelvitor253@gmail.com`
- Email: `obahotdog@gmail.com`
- Email: `bella.napoli@teste.com`

#### Entregadores (DELIVERY)
- Email: `vitorapps4@gmail.com`
- Email: `lucasnovais1217@gmail.com`

## Estrutura do Sistema

### 1. Serviços de Autenticação (`src/services/auth.ts`)
- `AuthService` - Classe principal para gerenciar autenticação
- `useAuth` - Hook personalizado para usar autenticação nos componentes

### 2. Contexto de Autenticação (`src/contexts/AuthContext.tsx`)
- `AuthProvider` - Provider do contexto de autenticação
- `useAuth` - Hook para acessar o contexto

### 3. Componentes de Proteção (`src/components/ProtectedRoute.tsx`)
- `ProtectedRoute` - Rotas protegidas por autenticação
- `CustomerRoute` - Rotas específicas para clientes
- `EstablishmentRoute` - Rotas específicas para estabelecimentos
- `DeliveryRoute` - Rotas específicas para entregadores

### 4. Página de Login (`src/pages/Login.tsx`)
- Interface moderna com tabs para cada tipo de usuário
- Validação de formulários
- Feedback visual de loading e erros
- Redirecionamento automático baseado no tipo de usuário

### 5. Configuração da API (`src/config/api.ts`)
- Configurações centralizadas da API
- Endpoints organizados por funcionalidade
- Funções utilitárias para requisições

## Como Usar

### 1. Configuração Inicial

1. Copie o arquivo `env.example` para `.env`:
```bash
cp env.example .env
```

2. Configure a URL da API no arquivo `.env`:
```env
VITE_API_URL=http://localhost:3001/api
```

### 2. Implementação do Backend

O backend precisa implementar os seguintes endpoints:

#### POST /api/auth/login
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

#### GET /api/auth/validate
```http
Authorization: Bearer jwt_token
```

#### POST /api/auth/logout
```http
Authorization: Bearer jwt_token
```

#### PUT /api/auth/profile
```http
Authorization: Bearer jwt_token
Content-Type: application/json

{
  "name": "Novo Nome",
  "phone": "(11) 88888-8888",
  "address": "Novo Endereço"
}
```

### 3. Uso no Frontend

#### Protegendo Rotas
```tsx
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Rota protegida para qualquer usuário autenticado
<ProtectedRoute>
  <MinhaPagina />
</ProtectedRoute>

// Rota específica para clientes
<CustomerRoute>
  <PaginaCliente />
</CustomerRoute>

// Rota específica para estabelecimentos
<EstablishmentRoute>
  <PaginaEstabelecimento />
</EstablishmentRoute>

// Rota específica para entregadores
<DeliveryRoute>
  <PaginaEntregador />
</DeliveryRoute>
```

#### Usando o Contexto de Autenticação
```tsx
import { useAuth } from '@/contexts/AuthContext';

const MinhaPagina = () => {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Faça login para continuar</div>;
  }

  return (
    <div>
      <h1>Bem-vindo, {user?.name}!</h1>
      <button onClick={logout}>Sair</button>
    </div>
  );
};
```

## Funcionalidades Implementadas

### ✅ Sistema de Login
- Login com email e senha
- Validação de credenciais
- Armazenamento seguro de token JWT
- Logout com limpeza de dados

### ✅ Proteção de Rotas
- Rotas protegidas por autenticação
- Rotas específicas por tipo de usuário
- Redirecionamento automático
- Loading states durante verificação

### ✅ Interface Moderna
- Design responsivo com Tailwind CSS
- Tabs para diferentes tipos de usuário
- Feedback visual de loading e erros
- Ícones intuitivos

### ✅ Gerenciamento de Estado
- Contexto global de autenticação
- Persistência de dados no localStorage
- Atualização automática do estado
- Limpeza de dados no logout

### ✅ Validação e Segurança
- Validação de formulários
- Tratamento de erros
- Tokens JWT seguros
- Headers de autorização automáticos

## Estrutura de Arquivos

```
src/
├── components/
│   ├── ProtectedRoute.tsx
│   └── Navigation.tsx (atualizado)
├── contexts/
│   └── AuthContext.tsx
├── pages/
│   └── Login.tsx
├── services/
│   └── auth.ts
├── config/
│   └── api.ts
└── App.tsx (atualizado)
```

## Próximos Passos

1. **Implementar o Backend**
   - Criar servidor Express/Node.js
   - Conectar com o banco MySQL
   - Implementar endpoints de autenticação
   - Configurar CORS

2. **Testar a Integração**
   - Testar login com dados reais
   - Verificar proteção de rotas
   - Testar logout e limpeza de dados

3. **Melhorias Futuras**
   - Recuperação de senha
   - Registro de novos usuários
   - Perfil de usuário completo
   - Upload de avatar

## Troubleshooting

### Erro de CORS
Se aparecer erro de CORS, configure o backend:
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
```

### Erro de Conexão
Verifique se:
1. O backend está rodando na porta 3001
2. A URL da API está configurada corretamente
3. O banco de dados está acessível

### Token Inválido
Se o token estiver inválido:
1. Faça logout e login novamente
2. Verifique se o JWT_SECRET está correto
3. Verifique a expiração do token

## Suporte

Para dúvidas ou problemas:
1. Verifique os logs do console do navegador
2. Verifique os logs do backend
3. Teste a conexão com o banco de dados
4. Verifique as configurações de CORS 
# Instruções para Login - QuickPainel

## 🚀 Como Iniciar o Sistema

### Opção 1: Script Automático (Recomendado)
Execute o arquivo `start-all.bat` clicando duas vezes nele. Isso vai:
1. Iniciar o backend na porta 3001
2. Aguardar 5 segundos
3. Iniciar o frontend na porta 8080

### Opção 2: Manual
1. **Backend**: Execute `start-backend.bat` ou vá na pasta `api` e execute `node server.js`
2. **Frontend**: Execute `start-frontend.bat` ou execute `npm run dev`

## 🔐 Credenciais de Teste

### Estabelecimentos (ESTABLISHMENT)
Use qualquer uma dessas credenciais:

1. **Email**: `manoelvitor253@gmail.com`
   - **Nome**: VITOR MANOEL DOS SANTOS

2. **Email**: `obahotdog@gmail.com`
   - **Nome**: Thiffany Flayra Fernandes dos Santos

3. **Email**: `bella.napoli@teste.com`
   - **Nome**: Bella Napoli

### Clientes (CUSTOMER) - Para teste
- **Email**: `cliente17991288208@clientedelivery.com`

### Entregadores (DELIVERY) - Para teste
- **Email**: `vitorapps4@gmail.com`

## 🌐 URLs de Acesso

- **Frontend**: http://localhost:8080
- **Backend**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## ⚠️ Solução de Problemas

### Erro de CORS
Se aparecer erro de CORS, verifique se:
1. O backend está rodando na porta 3001
2. O frontend está rodando na porta 8080
3. Use o script `start-all.bat` que configura tudo automaticamente

### Erro de Conexão
Se não conseguir conectar:
1. Verifique se as portas 3001 e 8080 estão livres
2. Execute `netstat -an | findstr :3001` para verificar se o backend está rodando
3. Execute `netstat -an | findstr :8080` para verificar se o frontend está rodando

## 🔧 Configurações

### Banco de Dados
- **Host**: srv1074.hstgr.io
- **Usuário**: u328800108_food
- **Banco**: u328800108_food_fly
- **JWT Secret**: quickdeliver_secret_key_2024

### Proxy
O frontend está configurado com proxy para o backend, então as requisições `/api/*` são redirecionadas automaticamente para `http://localhost:3001/api/*`.

## 📝 Logs

Para ver os logs do backend, verifique a janela do terminal onde ele está rodando.
Para ver os logs do frontend, abra o DevTools do navegador (F12) e vá na aba Console.

## Como fazer login no sistema

### 1. Acesse o sistema
- Abra o navegador e vá para: `http://localhost:8080`
- Você será redirecionado para a página de login

### 2. Credenciais de teste

#### Estabelecimento (Restaurante)
- **Email:** manoelvitor253@gmail.com
- **Senha:** 12345678

#### Cliente
- **Email:** cliente@teste.com
- **Senha:** 12345678

#### Entregador
- **Email:** entregador@teste.com
- **Senha:** 12345678

### 3. Funcionalidades por tipo de usuário

#### Estabelecimento
- Dashboard com estatísticas
- Gerenciamento de pedidos
- Controle de entregadores
- Configurações do estabelecimento

#### Cliente
- Visualização do cardápio
- Realização de pedidos
- Acompanhamento de pedidos
- Perfil do usuário

#### Entregador
- Visualização de pedidos disponíveis
- Aceitar/rejeitar pedidos
- Atualizar status de entrega
- Histórico de entregas

### 4. Observações
- O sistema usa autenticação JWT
- As sessões são mantidas no localStorage
- Para sair, use o botão "Sair" no menu 
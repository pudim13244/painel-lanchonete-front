# PainelQuick API - Deploy em Produção

## 1. Estrutura de Pastas

Coloque todo o backend (API Node.js) dentro de uma pasta chamada `painelquick`:

```
/var/www/
  └── painelquick/
        ├── api/
        ├── node_modules/
        ├── package.json
        └── ... (outros arquivos do backend)
```

## 2. Configuração do Nginx

Adicione este bloco ao seu arquivo de configuração do Nginx (ex: `/etc/nginx/sites-available/api.vmagenciadigital.com`):

```
server {
    listen 80;
    server_name api.vmagenciadigital.com;

    location /painelquick/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        # Remove o /painelquick do path antes de passar para o Node
        rewrite ^/painelquick/?(.*)$ /$1 break;
    }
}
```

- Reinicie o Nginx após editar: `sudo systemctl restart nginx`

## 3. Configuração do CORS no Backend

No seu `server.js` (ou arquivo principal do Express):

```
const cors = require('cors');
app.use(cors({
  origin: [
    'https://painelquick.vmagenciadigital.com', // frontend
    'https://outrodominio.com' // outros domínios permitidos
  ],
  credentials: true
}));
```

## 4. Ajuste das URLs no Frontend

No frontend, troque todas as chamadas de API para:

```
https://api.vmagenciadigital.com/painelquick/api/...
```

Exemplo:
```
axios.get('https://api.vmagenciadigital.com/painelquick/api/products')
```

## 5. Rodando a API

- Instale as dependências: `npm install`
- Inicie a API: `npm start` (ou `pm2 start npm --name painelquick -- start` para rodar em background)

## 6. Segurança
- Certifique-se de que a porta 3001 está fechada para acesso externo (apenas localhost).
- Use HTTPS em produção (adicione SSL no Nginx).

---

Pronto! Agora sua API estará acessível em:

```
https://api.vmagenciadigital.com/painelquick/api/
```

E pronta para ser consumida pelo frontend! 
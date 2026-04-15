# JWT Auth API — Node.js + Express + SQLite

API RESTful com autenticação JWT, cadastro de usuários, login e rotas protegidas.

---

## Estrutura do projeto

```
api/
├── src/
│   ├── config/
│   │   ├── database.js     # Conexão e schema SQLite
│   │   └── env.js          # Variáveis de ambiente
│   ├── controllers/
│   │   ├── authController.js   # register / login
│   │   └── userController.js   # rotas protegidas
│   ├── middlewares/
│   │   └── auth.js         # Verificação do JWT
│   ├── routes/
│   │   ├── auth.js         # /api/auth/*
│   │   └── users.js        # /api/users/* (protegidas)
│   ├── app.js              # Configuração do Express
│   └── server.js           # Entry-point
├── database.sqlite          # Criado automaticamente
├── package.json
└── README.md
```

---

## Instalação e uso

```bash
npm install
npm start          # produção
npm run dev        # desenvolvimento (nodemon)
```

Variáveis de ambiente opcionais:

| Variável        | Padrão                          | Descrição                     |
|-----------------|---------------------------------|-------------------------------|
| `PORT`          | `3000`                          | Porta do servidor             |
| `JWT_SECRET`    | `troque-este-segredo-em-producao` | Chave secreta do JWT        |
| `JWT_EXPIRES_IN`| `1h`                            | Expiração do token            |

---

## Endpoints

### Público

#### `GET /health`
Verifica se a API está online.

```json
{ "status": "ok" }
```

---

#### `POST /api/auth/register`
Cria um novo usuário e retorna o JWT.

**Body:**
```json
{
  "name": "Maria Silva",
  "email": "maria@email.com",
  "password": "senha123"
}
```

**Resposta 201:**
```json
{
  "message": "Usuário criado com sucesso.",
  "user": { "id": 1, "name": "Maria Silva", "email": "maria@email.com" },
  "token": "<jwt>"
}
```

---

#### `POST /api/auth/login`
Autentica o usuário e retorna o JWT.

**Body:**
```json
{
  "email": "maria@email.com",
  "password": "senha123"
}
```

**Resposta 200:**
```json
{
  "message": "Login realizado com sucesso.",
  "user": { "id": 1, "name": "Maria Silva", "email": "maria@email.com" },
  "token": "<jwt>"
}
```

---

### Protegidas 🔒

Todas exigem o header:
```
Authorization: Bearer <token>
```

#### `GET /api/users/me`
Retorna os dados do usuário autenticado.

#### `GET /api/users`
Lista todos os usuários cadastrados.

---

## Exemplos com cURL

```bash
# Cadastro
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria","email":"maria@email.com","password":"senha123"}'

# Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maria@email.com","password":"senha123"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# Rota protegida
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer $TOKEN"
```

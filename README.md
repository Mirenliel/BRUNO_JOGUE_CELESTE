API Node.js para autenticacao, controle de usuarios e acompanhamento diario de habitos saudaveis.

O projeto foi pensado para registrar habitos como ingestao de agua, atividade fisica, humor e observacoes diarias, permitindo acompanhar evolucao individual e medias gerais. uwu

Coisas utilizadas
- Node.js
- Express
- Sequelize
- MySQL
- JWT
- bcrypt
- express-validator

Checklist de coisas que a gente fez pouco a pouco
- cadastro e login com JWT
- senha com hash via bcrypt
- protecao de rotas com middleware de autenticacao
- autorizacao por roles `admin` e `user`
- CRUD de registros de habitos
- CRUD administrativo de usuarios
- resumo estatistico dos habitos
- endpoint de evolucao dos habitos
- validacao de dados de entrada
- CORS configurado para integracao com front-end

## Estrutura do projeto

src/
  config/
  controllers/
  database/
  middlewares/
  models/
  routes/
test/
testSupport/

## Variaveis de ambiente

Copie `.env.example` para `.env` e ajuste os valores:

```env
PORT=3000
CORS_ORIGIN=http://localhost:5173
ADMIN_EMAILS=admin@exemplo.com
DB_HOST=localhost
DB_PORT=3306
DB_NAME=projetointegrador
DB_USER=root
DB_PASSWORD=
JWT_SECRET=troque-este-segredo
```

## Como rodar

1. Instale as dependencias com `npm install`.
2. Garanta que o MySQL esteja rodando.
3. Crie o arquivo `.env` com base em `.env.example`.
4. Configure o banco nas variaveis de ambiente.
5. Rode `npm run dev` para desenvolvimento ou `npm start` para execucao normal.

O Sequelize sincroniza os modelos automaticamente ao iniciar a aplicacao.

## Scripts

- `npm run dev`: inicia o servidor em modo watch
- `npm start`: inicia o servidor normalmente
- `npm test`: executa os testes automatizados

## Rotas principais

### Autenticacao

- `POST /auth/register`
- `POST /auth/login`

### Habit records

- `POST /habit-records`
- `GET /habit-records`
- `GET /habit-records/:id`
- `PUT /habit-records/:id`
- `DELETE /habit-records/:id`
- `GET /habit-records/stats/summary`
- `GET /habit-records/stats/progress`

### Rotas administrativas de habit records

- `GET /habit-records/admin/all`
- `DELETE /habit-records/admin/:id`

### Usuarios

- `GET /users`
- `GET /users/:id`
- `PATCH /users/:id`
- `DELETE /users/:id`

Todas as rotas em `/habit-records` e `/users` exigem token JWT no header:

```http
Authorization: Bearer SEU_TOKEN
```

As rotas de `/users` e as rotas administrativas de `/habit-records` exigem usuario com role `admin`.

## Exemplos de uso

### Registrar usuario

```json
POST /auth/register
{
  "email": "usuario@email.com",
  "password": "123456"
}
```

### Fazer login

```json
POST /auth/login
{
  "email": "usuario@email.com",
  "password": "123456"
}
```

### Criar registro de habito

```json
POST /habit-records
{
  "date": "2026-04-07",
  "waterIntakeMl": 2000,
  "activityMinutes": 30,
  "mood": "bem",
  "notes": "Caminhei e bati a meta de agua"
}
```

## Testes

Os testes automatizados cobrem os fluxos principais de autenticacao, middlewares, usuarios e registros de habitos.

Para executar:

```bash
npm test
```


joao fez quase tudo ok

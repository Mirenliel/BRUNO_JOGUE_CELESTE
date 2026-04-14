# README - Back-end

Repositório do front: `https://github.com/Danilloxkl/Front_end_do_BRUNO_JOGUE_CELESTE`

API em Node.js para autenticação, gestão de usuários e registro de hábitos diários. O projeto usa Express, Sequelize e MySQL, com autenticação por JWT.

## Tecnologias

- Node.js
- Express
- Sequelize
- MySQL
- JWT
- bcrypt
- express-validator

## Requisitos

- Node.js 20 ou superior
- MySQL rodando localmente ou em outro host acessível
- npm

## Como rodar

1. Entre na pasta do projeto:

```bash
cd BRUNO_JOGUE_CELESTE
```

2. Instale as dependências:

```bash
npm install
```

3. Crie o arquivo `.env` na raiz do projeto.

Você pode usar o `.env.example` como base, mas este projeto também precisa das variáveis de banco abaixo:

```env
PORT=3000
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=troque-para-um-segredo-forte
ADMIN_EMAILS=admin@exemplo.com

DB_HOST=localhost
DB_PORT=3306
DB_NAME=projetointegrador
DB_USER=root
DB_PASSWORD=sua_senha
```

4. Garanta que o banco `DB_NAME` já exista no MySQL.

Observação: o Sequelize cria/sincroniza as tabelas automaticamente ao subir a aplicação, mas não cria o banco de dados em si.

5. Inicie o servidor:

```bash
npm run dev
```

Para rodar sem watch:

```bash
npm start
```

Se tudo estiver certo, a API sobe em `http://localhost:3000`.

## Dotenv

Este projeto usa `process.loadEnvFile()` do Node para carregar o `.env`.

- O arquivo principal deve ficar em `BRUNO_JOGUE_CELESTE/.env`
- Existe fallback para `src/.env`, mas o recomendado é manter na raiz
- O `.env` já está ignorado pelo `.gitignore`

### O que cada variável faz

- `PORT`: porta do servidor
- `CORS_ORIGIN`: origem permitida do front. Pode receber mais de uma URL separada por vírgula
- `JWT_SECRET`: chave usada para assinar os tokens
- `ADMIN_EMAILS`: emails que devem nascer com papel `admin` no cadastro
- `DB_HOST`: host do MySQL
- `DB_PORT`: porta do MySQL
- `DB_NAME`: nome do banco
- `DB_USER`: usuário do banco
- `DB_PASSWORD`: senha do banco

Exemplo com mais de uma origem no CORS:

```env
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
```

## Integração com o front-end

O front atual consome principalmente estas rotas:

- `POST /auth/register`
- `POST /auth/login`
- `GET /habit-records`
- `GET /habit-records/:id`
- `POST /habit-records`
- `PUT /habit-records/:id`
- `DELETE /habit-records/:id`
- `GET /habit-records/stats/summary`

Para a integração funcionar:

1. Deixe este back rodando em `http://localhost:3000`
2. Configure o front com `VITE_API_URL=http://localhost:3000`
3. Garanta que `CORS_ORIGIN` inclua a URL do Vite, normalmente `http://localhost:5173`

O token JWT deve ser enviado no header:

```http
Authorization: Bearer SEU_TOKEN
```

O front já faz isso automaticamente depois do login.

## Observação importante sobre a tela de admin do front

O back atual expõe rotas administrativas em:

- `GET /habit-records/admin/all`
- `DELETE /habit-records/admin/:id`
- `GET /users`
- `GET /users/:id`
- `PATCH /users/:id`
- `DELETE /users/:id`

A tela `Admin` do front, porém, está apontando para endpoints `/admin/habits`, que não existem neste back hoje. Então:

- login, cadastro e fluxo de hábitos estão integráveis
- a área de admin precisa alinhar os endpoints antes de funcionar com este back

## Admin padrão

Ao iniciar o back, a aplicação garante a existencia da conta administrativa padrão:

```text
email: admin@gmail.com
senha: 123456
```

Se esse email já existir, o sistema não cria outro usuário; ele apenas garante que a conta permaneça com papel `admin`.

## Scripts

- `npm run dev`: sobe o servidor com watch
- `npm start`: sobe o servidor normalmente
- `npm test`: roda os testes

## Testes

Para executar os testes automatizados:

```bash
npm test
```

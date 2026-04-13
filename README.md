# BRUNO_JOGUE_CELESTE

API Node.js para autenticacao de usuarios e registro diario de habitos.

## Como rodar

1. Copie `.env.example` para `.env`.
2. Ajuste as credenciais do banco MySQL.
3. Rode `npm install`.
4. Rode `npm run dev`.

## Scripts

- `npm run dev`: inicia o servidor em modo watch
- `npm start`: inicia o servidor normalmente
- `npm test`: executa os testes automatizados

## Admin e historico global

Para criar um usuario admin, defina `ADMIN_EMAIL` no `.env` com o email que tera acesso administrativo.

Exemplo:

```env
ADMIN_EMAIL=admin@email.com
```

Depois faca o cadastro desse usuario com:

```json
{
  "email": "admin@email.com",
  "password": "123456",
  "role": "admin"
}
```

Depois do login, o admin pode consultar o historico de todos os usuarios em:

`GET /habit-records/admin/all`

E tambem pode listar todos os usuarios em:

`GET /auth/users`

Envie o token no header:

```text
Authorization: Bearer SEU_TOKEN
```

## Proximo passo sugerido

Criar e manter testes automatizados para proteger os fluxos principais antes de adicionar novas funcionalidades.

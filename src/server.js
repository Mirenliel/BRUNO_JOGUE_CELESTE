import { connect } from './database/sqlConnection.js';
import express, { json } from 'express';
import authRouter from './routes/authRouter.js';
import './.env';

const PORT = process.env.PORT || 3000;
const app = express();

app.use(json());
app.use('/auth', authRouter);
// ...

app.get("/", (req, res) => {
  res.send('<h1> servidor node ativo :D <h1/>');
});

app.listen(PORT, async () => {
  await connect();
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

//HAHAJHDJHJAHDAHIAHOGHAIJAF EU AMOOOO O JOAAAAAAAAAAAAOOOOOOOOOOOOOOO :D
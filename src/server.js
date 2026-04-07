import { connect } from "./database/sqlConnection.js";
import express, { json } from "express";
import authRouter from "./routes/authRouter.js";
import "./models/HabitRecord.js";

process.loadEnvFile?.();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(json());
app.use("/auth", authRouter);

app.get("/", (req, res) => {
  res.send("<h1>Servidor Node ativo :D</h1>");
});

async function startServer() {
  try {
    await connect();

    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Erro ao iniciar o servidor:", error);
    process.exit(1);
  }
}

startServer();

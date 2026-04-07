import { existsSync } from "node:fs";
import { connect } from "./database/sqlConnection.js";
import express, { json } from "express";
import authRouter from "./routes/authRouter.js";
import habitRecordRouter from "./routes/habitRecordRouter.js";
import "./models/HabitRecord.js";

const envFilePath = existsSync(".env")
  ? ".env"
  : existsSync("src/.env")
  ? "src/.env"
  : null;

if (envFilePath) {
  process.loadEnvFile?.(envFilePath);
}

const PORT = process.env.PORT || 3000;
const app = express();

app.use(json());
app.use("/auth", authRouter);
app.use("/habit-records", habitRecordRouter);

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

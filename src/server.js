import { existsSync } from "node:fs";
import "./config/loadEnv.js";
import express, { json } from "express";
import cors from "cors";
import corsOptions from "./config/cors.js";
import { connect } from "./database/sqlConnection.js";
import authRouter from "./routes/authRouter.js";
import habitRecordRouter from "./routes/habitRecordRouter.js";
import userRouter from "./routes/userRouter.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";
import notFoundMiddleware from "./middlewares/notFoundMiddleware.js";
import "./models/HabitRecord.js";

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors(corsOptions));
app.use(json());
app.use("/auth", authRouter);
app.use("/habit-records", habitRecordRouter);
app.use("/users", userRouter);

app.get("/", (req, res) => {
  res.send("<h1>Servidor Node ativo :D</h1>");
});

app.use(notFoundMiddleware);
app.use(errorMiddleware);

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

import { existsSync } from "node:fs";
import { Sequelize } from "sequelize";

//esse ngc do env n parece ser nada tão mirabolante mas deve ajudar na segurança
//aprendi em um video do youtube rs -Luiz

const envFilePath = existsSync(".env")
  ? ".env"
  : existsSync("src/.env")
  ? "src/.env"
  : null;

if (envFilePath) {
  process.loadEnvFile?.(envFilePath);
}

const sequelize = new Sequelize(
  process.env.DB_NAME || "projetointegrador",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    port: Number(process.env.DB_PORT) || 3306,
  }
);

async function connect() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log("Conexao com o banco de dados estabelecida!");
  } catch (error) {
    console.error("Erro ao conectar com o banco de dados:", error);
    throw error;
  }
}

export { sequelize, connect };

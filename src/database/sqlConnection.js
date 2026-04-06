import { Sequelize } from "sequelize";

const sequelize = new Sequelize('projetointegrador', 'root', 'senai', {
    host: 'localhost',
    dialect: 'mysql',
    port: 3306,
    storage: './database.sqlite'
})

async function connect() {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        console.log('conexão com o banco de dados estabelecida!');
    } catch (error) {
        console.error('erro ao conectar:', error);
    }
}


export { sequelize, connect };
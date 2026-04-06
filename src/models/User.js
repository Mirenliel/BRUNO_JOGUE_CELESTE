import { DataTypes } from "sequelize";
import { sequelize } from "./index.js";

const User = sequelize.define("User", {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
//   role: {
//     type: DataTypes.STRING,
//     allowNull: false,                por enquanto não é usado
//     defaultValue: "user",
//   },
});

export default User;

import { DataTypes } from "sequelize";
import { sequelize } from "../database/sqlConnection.js";
import User from "./User.js";

const HabitRecord = sequelize.define("HabitRecord", {
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  waterIntakeMl: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  activityMinutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  mood: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "normal",
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

User.hasMany(HabitRecord, {
  foreignKey: "userId",
  as: "habitRecords",
});

HabitRecord.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

export default HabitRecord;

import HabitRecord from "../models/HabitRecord.js";

const habitRecordController = {
  create: async (req, res) => {
    try {
      const { date, waterIntakeMl, activityMinutes, mood, notes } = req.body;

      const habitRecord = await HabitRecord.create({
        date,
        waterIntakeMl,
        activityMinutes,
        mood,
        notes,
        userId: req.user.id,
      });

      return res.status(201).json(habitRecord);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  list: async (req, res) => {
    try {
      const records = await HabitRecord.findAll({
        where: { userId: req.user.id },
        order: [["date", "DESC"]],
      });

      return res.json(records);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const habitRecord = await HabitRecord.findOne({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
      });

      if (!habitRecord) {
        return res.status(404).json({ message: "Registro nao encontrado" });
      }

      return res.json(habitRecord);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const habitRecord = await HabitRecord.findOne({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
      });

      if (!habitRecord) {
        return res.status(404).json({ message: "Registro nao encontrado" });
      }

      const { date, waterIntakeMl, activityMinutes, mood, notes } = req.body;

      await habitRecord.update({
        date,
        waterIntakeMl,
        activityMinutes,
        mood,
        notes,
      });

      return res.json(habitRecord);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const habitRecord = await HabitRecord.findOne({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
      });

      if (!habitRecord) {
        return res.status(404).json({ message: "Registro nao encontrado" });
      }

      await habitRecord.destroy();

      return res.json({ message: "Registro removido com sucesso" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
};

export default habitRecordController;

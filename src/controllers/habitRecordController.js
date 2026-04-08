import HabitRecord from "../models/HabitRecord.js";

function calculateAverage(records, field) {
  if (records.length === 0) {
    return 0;
  }

  const total = records.reduce((sum, record) => sum + (record[field] ?? 0), 0);

  return Number((total / records.length).toFixed(2));
}

function buildMoodBreakdown(records) {
  return records.reduce((accumulator, record) => {
    const mood = record.mood || "nao informado";

    accumulator[mood] = (accumulator[mood] ?? 0) + 1;
    return accumulator;
  }, {});
}

function buildTrendLabel(currentValue, previousValue) {
  if (currentValue > previousValue) {
    return "improving";
  }

  if (currentValue < previousValue) {
    return "declining";
  }

  return "stable";
}

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

  adminList: async (req, res) => {
    try {
      const records = await HabitRecord.findAll({
        include: [
          {
            association: "user",
            attributes: ["id", "email", "role"],
          },
        ],
        order: [["date", "DESC"]],
      });

      return res.json(records);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  summary: async (req, res) => {
    try {
      const [userRecords, allRecords] = await Promise.all([
        HabitRecord.findAll({
          where: { userId: req.user.id },
          order: [["date", "DESC"]],
        }),
        HabitRecord.findAll({}),
      ]);

      const totalTrackedUsers = new Set(
        allRecords
          .map((record) => record.userId)
          .filter((userId) => userId !== undefined && userId !== null)
      ).size;

      return res.json({
        user: {
          totalRecords: userRecords.length,
          averageWaterIntakeMl: calculateAverage(userRecords, "waterIntakeMl"),
          averageActivityMinutes: calculateAverage(userRecords, "activityMinutes"),
          moodBreakdown: buildMoodBreakdown(userRecords),
          latestRecordDate: userRecords[0]?.date ?? null,
        },
        general: {
          totalTrackedUsers,
          totalRecords: allRecords.length,
          averageWaterIntakeMl: calculateAverage(allRecords, "waterIntakeMl"),
          averageActivityMinutes: calculateAverage(allRecords, "activityMinutes"),
        },
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  progress: async (req, res) => {
    try {
      const records = await HabitRecord.findAll({
        where: { userId: req.user.id },
        order: [["date", "ASC"]],
      });

      const history = records.map((record, index) => {
        const previousRecord = records[index - 1];

        return {
          date: record.date,
          waterIntakeMl: record.waterIntakeMl,
          activityMinutes: record.activityMinutes,
          mood: record.mood,
          notes: record.notes,
          changes: {
            waterIntakeMl: previousRecord
              ? record.waterIntakeMl - previousRecord.waterIntakeMl
              : null,
            activityMinutes: previousRecord
              ? record.activityMinutes - previousRecord.activityMinutes
              : null,
          },
        };
      });

      if (records.length < 2) {
        return res.json({
          totalRecords: records.length,
          trend: {
            waterIntakeMl: "insufficient_data",
            activityMinutes: "insufficient_data",
          },
          history,
        });
      }

      const previousRecord = records[records.length - 2];
      const latestRecord = records[records.length - 1];

      return res.json({
        totalRecords: records.length,
        trend: {
          waterIntakeMl: buildTrendLabel(
            latestRecord.waterIntakeMl,
            previousRecord.waterIntakeMl
          ),
          activityMinutes: buildTrendLabel(
            latestRecord.activityMinutes,
            previousRecord.activityMinutes
          ),
        },
        history,
      });
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

  adminDelete: async (req, res) => {
    try {
      const habitRecord = await HabitRecord.findByPk(req.params.id);

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

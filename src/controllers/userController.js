import User from "../models/User.js";

function serializeUser(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

const userController = {
  list: async (req, res) => {
    try {
      const users = await User.findAll({
        order: [["id", "ASC"]],
      });

      return res.json(users.map(serializeUser));
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);

      if (!user) {
        return res.status(404).json({ message: "Usuario nao encontrado" });
      }

      return res.json(serializeUser(user));
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
};

export default userController;

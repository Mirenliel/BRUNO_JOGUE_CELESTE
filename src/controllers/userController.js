import bcrypt from "bcrypt";
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

  update: async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);

      if (!user) {
        return res.status(404).json({ message: "Usuario nao encontrado" });
      }

      const { email, password, role } = req.body;

      if (email && email !== user.email) {
        const existingUser = await User.findOne({ where: { email } });

        if (existingUser && existingUser.id !== user.id) {
          return res.status(409).json({ message: "Email ja cadastrado" });
        }
      }

      const payload = {};

      if (email) {
        payload.email = email;
      }

      if (role) {
        payload.role = role;
      }

      if (password) {
        payload.password = await bcrypt.hash(password, 10);
      }

      await user.update(payload);

      return res.json(serializeUser(user));
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);

      if (!user) {
        return res.status(404).json({ message: "Usuario nao encontrado" });
      }

      await user.destroy();

      return res.json({ message: "Usuario removido com sucesso" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
};

export default userController;

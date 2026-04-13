import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "segredo";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim().toLowerCase();

const authController = {
  register: async (req, res) => {
    try {
      const { email, password, role } = req.body;
      const normalizedEmail = email.trim().toLowerCase();
      const requestedRole = role || "user";

      const existingUser = await User.findOne({ where: { email: normalizedEmail } });

      if (existingUser) {
        return res.status(409).json({ message: "Email ja cadastrado" });
      }

      if (
        requestedRole === "admin" &&
        (!ADMIN_EMAIL || normalizedEmail !== ADMIN_EMAIL)
      ) {
        return res.status(403).json({
          message:
            "Nao foi permitido criar admin com este email. Configure ADMIN_EMAIL no .env para liberar esse cadastro.",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        email: normalizedEmail,
        password: hashedPassword,
        role: requestedRole,
      });

      return res.status(201).json({
        message: "Usuario criado",
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const normalizedEmail = email.trim().toLowerCase();

      const user = await User.findOne({ where: { email: normalizedEmail } });

      if (!user) {
        return res.status(404).json({ message: "Usuario nao encontrado" });
      }

      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(401).json({ message: "Senha invalida" });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        SECRET,
        { expiresIn: "1h" }
      );

      return res.json({
        message: "Login sucesso",
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        token,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  listUsers: async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: ["id", "email", "role", "createdAt", "updatedAt"],
        order: [["id", "ASC"]],
      });

      return res.json(users);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
};

export default authController;

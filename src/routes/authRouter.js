import express from "express";
import { body } from "express-validator";
import authController from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import validationMiddleware from "../middlewares/validationMiddleware.js";

const authRouter = express.Router();

const registerValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email obrigatorio")
    .isEmail()
    .withMessage("Email invalido"),
  body("password")
    .notEmpty()
    .withMessage("Senha obrigatoria")
    .isLength({ min: 6 })
    .withMessage("A senha deve ter pelo menos 6 caracteres"),
  body("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("O cargo deve ser user ou admin"),
];

const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email obrigatorio")
    .isEmail()
    .withMessage("Email invalido"),
  body("password").notEmpty().withMessage("Senha obrigatoria"),
];

authRouter.post(
  "/register",
  registerValidation,
  validationMiddleware,
  authController.register
);
authRouter.post(
  "/login",
  loginValidation,
  validationMiddleware,
  authController.login
);

authRouter.get(
  "/users",
  authMiddleware,
  roleMiddleware("admin"),
  authController.listUsers
);

export default authRouter;

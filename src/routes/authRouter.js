import express from "express";
import { body } from "express-validator";
import authController from "../controllers/authController.js";
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

export default authRouter;

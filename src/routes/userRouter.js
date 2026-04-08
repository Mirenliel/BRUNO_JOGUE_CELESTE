import express from "express";
import { body, param } from "express-validator";
import userController from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import validationMiddleware from "../middlewares/validationMiddleware.js";

const userRouter = express.Router();

const idValidation = [
  param("id").isInt({ min: 1 }).withMessage("Id invalido"),
];

const updateValidation = [
  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Email invalido"),
  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("A senha deve ter pelo menos 6 caracteres"),
  body("role")
    .optional()
    .isIn(["admin", "user"])
    .withMessage("Role invalida"),
];

userRouter.use(authMiddleware);
userRouter.use(roleMiddleware("admin"));

userRouter.get("/", userController.list);

userRouter.get(
  "/:id",
  idValidation,
  validationMiddleware,
  userController.getById
);

userRouter.patch(
  "/:id",
  idValidation,
  updateValidation,
  validationMiddleware,
  userController.update
);

userRouter.delete(
  "/:id",
  idValidation,
  validationMiddleware,
  userController.delete
);

export default userRouter;

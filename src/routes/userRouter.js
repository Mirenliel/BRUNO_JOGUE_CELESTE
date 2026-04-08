import express from "express";
import { param } from "express-validator";
import userController from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import validationMiddleware from "../middlewares/validationMiddleware.js";

const userRouter = express.Router();

const idValidation = [
  param("id").isInt({ min: 1 }).withMessage("Id invalido"),
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

export default userRouter;

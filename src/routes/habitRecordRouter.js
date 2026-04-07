import express from "express";
import { body, param } from "express-validator";
import habitRecordController from "../controllers/habitRecordController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import validationMiddleware from "../middlewares/validationMiddleware.js";

const habitRecordRouter = express.Router();

const idValidation = [
  param("id").isInt({ min: 1 }).withMessage("Id invalido"),
];

const habitRecordValidation = [
  body("date")
    .notEmpty()
    .withMessage("Data obrigatoria")
    .isISO8601()
    .withMessage("Data invalida"),
  body("waterIntakeMl")
    .optional()
    .isInt({ min: 0 })
    .withMessage("A ingestao de agua deve ser um numero maior ou igual a zero"),
  body("activityMinutes")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Os minutos de atividade devem ser maiores ou iguais a zero"),
  body("mood")
    .optional()
    .isLength({ min: 2, max: 30 })
    .withMessage("O humor deve ter entre 2 e 30 caracteres"),
  body("notes")
    .optional()
    .isLength({ max: 500 })
    .withMessage("As observacoes devem ter no maximo 500 caracteres"),
];

habitRecordRouter.use(authMiddleware);

habitRecordRouter.post(
  "/",
  habitRecordValidation,
  validationMiddleware,
  habitRecordController.create
);

habitRecordRouter.get("/", habitRecordController.list);

habitRecordRouter.get(
  "/:id",
  idValidation,
  validationMiddleware,
  habitRecordController.getById
);

habitRecordRouter.put(
  "/:id",
  idValidation,
  habitRecordValidation,
  validationMiddleware,
  habitRecordController.update
);

habitRecordRouter.delete(
  "/:id",
  idValidation,
  validationMiddleware,
  habitRecordController.delete
);

export default habitRecordRouter;

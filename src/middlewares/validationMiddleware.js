import { validationResult } from "express-validator";

function validationMiddleware(req, res, next) {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  return res.status(400).json({
    errors: errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
    })),
  });
}

export default validationMiddleware;

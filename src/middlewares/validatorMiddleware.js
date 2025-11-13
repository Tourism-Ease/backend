import { validationResult } from 'express-validator';
import APIError from '../utils/apiError.js';

/**
 * Middleware to handle validation errors from express-validator.
 * Throws an APIError if validation fails, so it can be handled by the global error handler.
 *
 * @example
 * router.post('/user', userValidator, validatorMiddleware, createUser);
 */
export const validatorMiddleware = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Build a readable array of errors
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    // Throw APIError — global error handler will catch it
    return next(new APIError(JSON.stringify(formattedErrors), 400));
  }

  next();
};

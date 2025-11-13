import { check } from 'express-validator';

import UserModel from '../models/userModel.js';
import APIError from '../utils/apiError.js';
import { validatorMiddleware } from '../middlewares/validatorMiddleware.js';

/**
 * =============================
 * Auth Validators
 * =============================
 */

// Signup Validator
export const signupValidator = [
  check('firstName')
    .notEmpty()
    .withMessage('User firstName required')
    .isLength({ min: 3 })
    .withMessage('Too short User firstName'),

  check('lastName')
    .notEmpty()
    .withMessage('User lastName required')
    .isLength({ min: 3 })
    .withMessage('Too short User lastName'),

  check('email')
    .notEmpty()
    .withMessage('User email required')
    .isEmail()
    .withMessage('User email invalid')
    .custom(async (value) => {
      const user = await UserModel.findOne({ email: value });
      if (user) throw new APIError(`This email already exists: ${value}`, 400);
      return true;
    }),

  check('password')
    .notEmpty()
    .withMessage('User password required')
    .isLength({ min: 6 })
    .withMessage('User password must be at least 6 characters'),

  validatorMiddleware,
];

// Login Validator
export const loginValidator = [
  check('email')
    .notEmpty()
    .withMessage('User email required')
    .isEmail()
    .withMessage('User email invalid'),

  check('password')
    .notEmpty()
    .withMessage('User password required')
    .isLength({ min: 6 })
    .withMessage('User password must be at least 6 characters'),

  validatorMiddleware,
];

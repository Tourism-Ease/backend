import { check } from 'express-validator';
import bcrypt from 'bcryptjs';

import UserModel from '../models/userModel.js';
import APIError from '../utils/apiError.js';
import { validatorMiddleware } from '../middlewares/validatorMiddleware.js';

/**
 * =============================
 * User Validators
 * =============================
 */

// Get User by ID
export const getUserValidator = [
  check('id').isMongoId().withMessage('Invalid User Id format'),
  validatorMiddleware,
];

// Create User
export const createUserValidator = [
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

  check('phone')
    .optional()
    .isMobilePhone(['ar-EG', 'ar-SA'])
    .withMessage('User phone invalid; Only accept ar-EG and ar-SA'),

  check('avatar').optional(),
  check('role').optional(),

  validatorMiddleware,
];

// Update User
export const updateUserValidator = [
  check('id').isMongoId().withMessage('Invalid User Id format'),

  check('firstName').optional().isLength({ min: 3 }).withMessage('Too short User firstName'),

  check('lastName').optional().isLength({ min: 3 }).withMessage('Too short User lastName'),

  check('email')
    .optional()
    .isEmail()
    .withMessage('User email invalid')
    .custom(async (value, { req }) => {
      const { id } = req.params;
      const user = await UserModel.findOne({ email: value, _id: { $ne: id } });
      if (user) throw new APIError(`This email already exists: ${value}`, 400);
      return true;
    }),

  check('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('User password must be at least 6 characters'),

  check('phone').optional().isMobilePhone(['ar-EG', 'ar-SA']).withMessage('User phone invalid'),

  check('avatar').optional(),
  check('role').optional(),

  validatorMiddleware,
];

// Change User Password (Admin)
export const changeUserPasswordValidator = [
  check('id').isMongoId().withMessage('Invalid User Id format'),
  check('currentPassword').notEmpty().withMessage('User currentPassword required'),

  check('password')
    .notEmpty()
    .withMessage('User password required')
    .isLength({ min: 6 })
    .withMessage('User password must be at least 6 characters')
    .custom(async (password, { req }) => {
      const { id, currentPassword } = { ...req.params, ...req.body };
      const user = await UserModel.findById(id);
      if (!user) throw new APIError(`No User for this Id ${id}`, 404);

      const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
      if (!isMatch) throw new APIError('Incorrect currentPassword', 400);

      return true;
    }),

  validatorMiddleware,
];

// Delete User
export const deleteUserValidator = [
  check('id').isMongoId().withMessage('Invalid User Id format'),
  validatorMiddleware,
];

/**
 * =============================
 * Logged-in User Validators
 * =============================
 */

// Change logged-in user password
export const changeLoggedUserPasswordValidator = [
  check('currentPassword').notEmpty().withMessage('User currentPassword required'),

  check('password')
    .notEmpty()
    .withMessage('User password required')
    .isLength({ min: 6 })
    .withMessage('User password must be at least 6 characters')
    .custom(async (password, { req }) => {
      const user = await UserModel.findById(req.user._id);
      if (!user) throw new APIError('User not found', 404);

      const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
      if (!isMatch) throw new APIError('Incorrect currentPassword', 400);

      return true;
    }),

  validatorMiddleware,
];

// Update logged-in user info
export const updateLoggedUserValidator = [
  check('firstName').optional().isLength({ min: 3 }).withMessage('Too short User firstName'),

  check('lastName').optional().isLength({ min: 3 }).withMessage('Too short User lastName'),

  check('email')
    .optional()
    .isEmail()
    .withMessage('User email invalid')
    .custom(async (value, { req }) => {
      const user = await UserModel.findOne({ email: value });
      if (user && user._id.toString() !== req.user._id.toString())
        throw new APIError(`This email already exists: ${value}`, 400);
      return true;
    }),

  check('phone').optional().isMobilePhone(['ar-EG', 'ar-SA']).withMessage('User phone invalid'),

  check('avatar').optional(),

  validatorMiddleware,
];

import { body, check } from 'express-validator';
import { validatorMiddleware } from '../middlewares/validatorMiddleware.js';

export const createPackageValidator = [
  check('title').notEmpty().withMessage('Title is required'),
  check('hotel').notEmpty().withMessage('Hotel is required'),
  check('basePrice')
    .notEmpty()
    .withMessage('Base price is required')
    .isFloat({ gt: 0 })
    .withMessage('Base price must be greater than 0'),
  // check('roomTypes').optional().withMessage('At least one room type must be selected'),
  check('transportation').notEmpty().withMessage('Transportation is required'),
  check('destination').notEmpty().withMessage('Destination is required'),
  validatorMiddleware,
];
export const updatePackageValidator = [
  check('durationDays')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duration days must be at least 1'),

  check('basePrice')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('Base price must be greater than 0'),
  check('transportation').optional(),

  validatorMiddleware,
];

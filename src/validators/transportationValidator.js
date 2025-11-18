import { check } from 'express-validator';
import { validatorMiddleware } from '../middlewares/validatorMiddleware.js';

/**
 * =============================
 * Transportation Validators
 * =============================
 */

// Get Transportation by ID
export const getTransportationValidator = [
  check('id').isMongoId().withMessage('Invalid Transportation Id format'),
  validatorMiddleware,
];

// Create Transportation
export const createTransportationValidator = [
  check('companyName')
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ min: 2 })
    .withMessage('Company name is too short (min 2 chars)'),

  check('type')
    .notEmpty()
    .withMessage('Transportation type is required')
    .isIn(['bus', 'hiAce'])
    .withMessage('Transportation type must be one of: bus, hiAce'),

  check('class')
    .optional()
    .isIn(['Economy', 'VIP'])
    .withMessage('Transportation class must be one of: Economy, VIP'),

  check('description').optional().isString().withMessage('Description must be a string'),

  validatorMiddleware,
];

// Update Transportation
export const updateTransportationValidator = [
  check('id').isMongoId().withMessage('Invalid Transportation Id format'),

  check('companyName')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Company name is too short (min 2 chars)'),

  check('type')
    .optional()
    .isIn(['bus', 'hiAce', 'plane'])
    .withMessage('Transportation type must be one of: bus, hiAce, plane'),

  check('class')
    .optional()
    .isIn(['Economy', 'VIP'])
    .withMessage('Transportation class must be one of: Economy, VIP'),

  check('description').optional().isString().withMessage('Description must be a string'),

  check('price').optional().isFloat({ min: 1 }).withMessage('Price must be a positive number'),

  validatorMiddleware,
];

// Delete Transportation
export const deleteTransportationValidator = [
  check('id').isMongoId().withMessage('Invalid Transportation Id format'),
  validatorMiddleware,
];

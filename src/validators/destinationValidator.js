import { check } from 'express-validator';
import { validatorMiddleware } from '../middlewares/validatorMiddleware.js';

export const createDestinationValidator = [
  check('name').notEmpty().withMessage('Destination name required'),
  check('country').notEmpty().withMessage('Country is required'),
  check('city').notEmpty().withMessage('City is required'),
  check('description').optional().isString(),
  validatorMiddleware,
];

export const updateDestinationValidator = [
  check('name').optional().isString(),
  check('country').optional().isString(),
  check('city').optional().isString(),
  check('description').optional().isString(),
  validatorMiddleware,
];

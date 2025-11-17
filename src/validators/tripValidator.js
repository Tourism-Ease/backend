import { check } from 'express-validator';
import { validatorMiddleware } from '../middlewares/validatorMiddleware.js';

/**
 * =============================
 * Trip Validators
 * =============================
 */

// Get Trip by ID
export const getTripValidator = [
  check('id').isMongoId().withMessage('Invalid Trip Id format'),
  validatorMiddleware,
];

// Create Trip
export const createTripValidator = [
  check('title')
    .notEmpty()
    .withMessage('Trip title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Trip title must be between 3 and 100 characters'),

  check('destination')
    .notEmpty()
    .withMessage('Destination is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Destination must be between 2 and 100 characters'),

  check('price')
    .notEmpty()
    .withMessage('Trip price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  check('duration')
    .notEmpty()
    .withMessage('Duration is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Duration must be between 2 and 50 characters'),

  check('pickUp').optional().isString().withMessage('Pick-up must be a string'),

  check('overview')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Overview cannot exceed 500 characters'),

  check('highlights')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Maximum 10 highlights are allowed'),

  check('whatToBring')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Maximum 10 items are allowed in whatToBring'),

  // Transportation validation
  check('transportation.transportationId')
    .notEmpty()
    .withMessage('Transportation reference is required')
    .isMongoId()
    .withMessage('Invalid Transportation Id format'),

  check('transportation.price')
    .notEmpty()
    .withMessage('Transportation price is required')
    .isFloat({ min: 0 })
    .withMessage('Transportation price must be a positive number'),

  // // Image validation
  // check('imageCover')
  //   .notEmpty()
  //   .withMessage('Main cover image (imageCover) is required'),

  check('images')
    .optional()
    .isArray({ max: 5 })
    .withMessage('Maximum 5 additional images are allowed'),

  validatorMiddleware,
];

// Update Trip
export const updateTripValidator = [
  check('id').isMongoId().withMessage('Invalid Trip Id format'),

  check('title')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Trip title must be between 3 and 100 characters'),

  check('destination')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Destination must be between 2 and 100 characters'),

  check('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),

  check('duration')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Duration must be between 2 and 50 characters'),

  check('pickUp').optional().isString().withMessage('Pick-up must be a string'),

  check('overview')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Overview cannot exceed 500 characters'),

  check('highlights')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Maximum 10 highlights are allowed'),

  check('whatToBring')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Maximum 10 items are allowed in whatToBring'),

  // Transportation validation
  check('transportation.transportationId')
    .optional()
    .isMongoId()
    .withMessage('Invalid Transportation Id format'),

  check('transportation.price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Transportation price must be a positive number'),

  // Image validation
  check('imageCover').optional().isString().withMessage('imageCover must be a string'),

  check('images')
    .optional()
    .isArray({ max: 5 })
    .withMessage('Maximum 5 additional images are allowed'),

  validatorMiddleware,
];

// Delete Trip
export const deleteTripValidator = [
  check('id').isMongoId().withMessage('Invalid Trip Id format'),
  validatorMiddleware,
];

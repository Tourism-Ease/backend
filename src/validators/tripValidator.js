import { check, body } from 'express-validator';
import { validatorMiddleware } from '../middlewares/validatorMiddleware.js';


// Get Trip by ID
export const getTripValidator = [
  check('id').isMongoId().withMessage('Invalid Trip Id format'),
  validatorMiddleware,
];

// Create Trip
export const createTripValidator = [
  body('title')
    .notEmpty().withMessage('Trip title is required')
    .isLength({ min: 3, max: 100 }).withMessage('Trip title must be between 3 and 100 characters'),

  body('destination')
    .notEmpty().withMessage('Destination ID is required')
    .isMongoId()
    .withMessage('Destination ID must be a valid MongoID'),

  // Egyptian price (required)
  body('egyptianPrice')
    .notEmpty().withMessage('Egyptian price is required')
    .isFloat({ min: 0 }).withMessage('Egyptian price must be a positive number'),

  // Optional children price
  body('childrenPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Children price must be a positive number'),

  // Optional foreigner price
  body('foreignerPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Foreigner price must be a positive number'),

  body('duration')
    .notEmpty().withMessage('Duration is required')
    .isLength({ min: 2, max: 50 }).withMessage('Duration must be between 2 and 50 characters'),

  // pickUp as object
  body('pickUp.time')
    .optional()
    .isString().withMessage('Pick-up time must be a string'),

  body('pickUp.place')
    .optional()
    .isString().withMessage('Pick-up place must be a string'),

  body('overview')
    .optional()
    .isLength({ max: 500 }).withMessage('Overview cannot exceed 500 characters'),

  body('highlights')
    .optional()
    .isArray({ max: 10 }).withMessage('Maximum 10 highlights are allowed'),

  body('whatToBring')
    .optional()
    .isArray({ max: 10 }).withMessage('Maximum 10 items are allowed in whatToBring'),

  // ImageCover must exist
  body('imageCover')
    .notEmpty().withMessage('Main cover image (imageCover) is required'),

  body('images')
    .optional()
    .isArray({ max: 5 }).withMessage('Maximum 5 additional images are allowed'),

  validatorMiddleware,
];


// Update Trip
export const updateTripValidator = [
  check('id').isMongoId().withMessage('Invalid Trip Id format'),

  body('title')
    .optional()
    .isLength({ min: 3, max: 100 }).withMessage('Trip title must be between 3 and 100 characters'),

  body('destination')
    .notEmpty().withMessage('Destination ID is required')
    .isMongoId()
    .withMessage('Destination ID must be a valid MongoID'),

  body('egyptianPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Egyptian price must be a positive number'),

  body('childrenPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Children price must be a positive number'),

  body('foreignerPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Foreigner price must be a positive number'),

  body('duration')
    .optional()
    .isLength({ min: 2, max: 50 }).withMessage('Duration must be between 2 and 50 characters'),

  body('pickUp.time')
    .optional()
    .isString().withMessage('Pick-up time must be a string'),

  body('pickUp.place')
    .optional()
    .isString().withMessage('Pick-up place must be a string'),

  body('overview')
    .optional()
    .isLength({ max: 500 }).withMessage('Overview cannot exceed 500 characters'),

  body('highlights')
    .optional()
    .isArray({ max: 10 }).withMessage('Maximum 10 highlights are allowed'),

  body('whatToBring')
    .optional()
    .isArray({ max: 10 }).withMessage('Maximum 10 items are allowed in whatToBring'),

  body('imageCover')
    .optional()
    .isString().withMessage('imageCover must be a string'),

  body('images')
    .optional()
    .isArray({ max: 5 }).withMessage('Maximum 5 additional images are allowed'),

  validatorMiddleware,
];

// Delete Trip
export const deleteTripValidator = [
  check('id').isMongoId().withMessage('Invalid Trip Id format'),
  validatorMiddleware,
];

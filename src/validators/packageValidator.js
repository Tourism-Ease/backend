import { body, check } from 'express-validator';
import mongoose from 'mongoose';
import { validatorMiddleware } from '../middlewares/validatorMiddleware.js';



// GET PACKAGE BY ID VALIDATOR
export const getPackageValidator = [
  check('id').isMongoId().withMessage('Invalid Package Id format'),
  validatorMiddleware,
];

//  CREATE PACKAGE VALIDATOR
export const createPackageValidator = [
  body('title')
    .notEmpty()
    .withMessage('Package title is required')
    .isLength({ min: 3 })
    .withMessage('Package title must be at least 3 characters'),

  body('hotel')
    .notEmpty()
    .withMessage('Hotel ID is required')
    .custom(val => mongoose.Types.ObjectId.isValid(val))
    .withMessage('Hotel ID must be a valid MongoID'),

  body('destination')
    .notEmpty()
    .withMessage('Destination ID is required')
    .custom(val => mongoose.Types.ObjectId.isValid(val))
    .withMessage('Destination ID must be a valid MongoID'),

  // body('pickupLocations')
  //   .isArray({ min: 1 })
  //   .withMessage('At least one pickup location is required')
  //   .custom(arr => arr.every(loc =>
  //     loc.city && typeof loc.city === 'string' &&
  //     loc.place && typeof loc.place === 'string' &&
  //     loc.time && typeof loc.time === 'string' &&
  //     (loc.priceAdjustment === undefined || typeof loc.priceAdjustment === 'number')
  //   ))
  //   .withMessage('Each pickup location must have city, place, time, and optional priceAdjustment'),

  body('durationDays')
    .notEmpty()
    .withMessage('Duration is required')
    .isInt({ min: 1 })
    .withMessage('Duration must be at least 1 day'),

  body('shortDesc')
    .notEmpty()
    .withMessage('Short Descreption is required')
    .isLength({ min: 10 })
    .withMessage('Short Descreption must be at least 10 characters'),

  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 20 })
    .withMessage('Description must be at least 20 characters'),


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

  // body('itinerary')
  //   .isArray({ min: 1 })
  //   .withMessage('Itinerary must have at least one day')
  //   .custom(arr => arr.every(day =>
  //     day.day && Number.isInteger(day.day) && day.day >= 1 &&
  //     day.title && typeof day.title === 'string' && day.title.trim().length >= 3 &&
  //     day.description && typeof day.description === 'string' && day.description.trim().length >= 10
  //   ))
  //   .withMessage('Each itinerary day must have valid day number, title, and description'),

  body('imageCover')
    .notEmpty()
    .withMessage('Cover image is required'),

  body('images')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Images must be an array with max 10 items'),

  // body('packageTransportation')
  //   .notEmpty()
  //   .withMessage('Transportation info is required')
  //   .custom(obj =>
  //     obj.transportation && mongoose.Types.ObjectId.isValid(obj.transportation) &&
  //     obj.price !== undefined && typeof obj.price === 'number' && obj.price >= 0
  //   )
  //   .withMessage('Transportation must include valid transport ID and non-negative price'),

  body('capacity')
    .notEmpty()
    .withMessage('Package capacity is required')
    .isInt({ min: 1 })
    .withMessage('Capacity must be at least 1 seat'),

  body('departureDate')
    .notEmpty()
    .withMessage('Departure date is required')
    .isISO8601()
    .withMessage('Departure date must be a valid date'),

  validatorMiddleware
];

//  UPDATE PACKAGE VALIDATOR
export const updatePackageValidator = [
  check('id')
    .optional()
    .custom(val => mongoose.Types.ObjectId.isValid(val))
    .withMessage('Package ID must be a valid MongoID'),

  body('title').optional().isLength({ min: 3 }).withMessage('Package title must be at least 3 characters'),

  body('hotel')
    .optional()
    .custom(val => mongoose.Types.ObjectId.isValid(val))
    .withMessage('Hotel ID must be a valid MongoID'),

  body('destination')
    .optional()
    .custom(val => mongoose.Types.ObjectId.isValid(val))
    .withMessage('Destination ID must be a valid MongoID'),

  // body('pickupLocations')
  //   .optional()
  //   .isArray({ min: 1 })
  //   .withMessage('Pickup locations must be a non-empty array')
  //   .custom(arr => arr.every(loc =>
  //     loc.city && typeof loc.city === 'string' &&
  //     loc.place && typeof loc.place === 'string' &&
  //     loc.time && typeof loc.time === 'string' &&
  //     (loc.priceAdjustment === undefined || typeof loc.priceAdjustment === 'number')
  //   ))
  // .withMessage('Each pickup location must have city, place, time, and optional priceAdjustment'),

  body('durationDays').optional().isInt({ min: 1 }).withMessage('Duration must be at least 1 day'),

  body('description').optional().isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),


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

  // body('itinerary')
  //   .optional()
  //   .isArray({ min: 1 })
  //   .withMessage('Itinerary must be a non-empty array')
  //   .custom(arr => arr.every(day =>
  //     day.day && Number.isInteger(day.day) && day.day >= 1 &&
  //     day.title && typeof day.title === 'string' && day.title.trim().length >= 3 &&
  //     day.description && typeof day.description === 'string' && day.description.trim().length >= 10
  //   ))
  //   .withMessage('Each itinerary day must have valid day number, title, and description'),

  // body('imageCover').optional().notEmpty().withMessage('Cover image is required'),

  // body('images').optional().isArray({ max: 5 }).withMessage('Images must be an array with max 5 items'),

  // body('packageTransportation')
  //   .optional()
  //   .custom(obj =>
  //     obj.transportation && mongoose.Types.ObjectId.isValid(obj.transportation) &&
  //     obj.price !== undefined && typeof obj.price === 'number' && obj.price >= 0
  //   )
  //   .withMessage('Transportation must include valid transport ID and non-negative price'),

  body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be at least 1 seat'),

  body('departureDate')
    .notEmpty()
    .withMessage('Departure date is required')
    .isISO8601()
    .withMessage('Departure date must be a valid date'),

  validatorMiddleware
];


//  DELETE PACKAGE VALIDATOR
export const deletePackageValidator = [
  check('id').isMongoId().withMessage('Invalid Pacakge Id format'),
  validatorMiddleware,
];


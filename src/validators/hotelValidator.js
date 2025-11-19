import { check, body } from 'express-validator';
import mongoose from 'mongoose';
import { validatorMiddleware } from '../middlewares/validatorMiddleware.js';
import APIError from '../utils/apiError.js';

// Create hotel validator
export const createHotelValidator = [
  body('name')
    .notEmpty()
    .withMessage('Hotel name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Hotel name must be 2-100 characters')
  ,

  body('stars')
    .notEmpty()
    .withMessage('Stars rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Stars must be between 1 and 5'),

  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 20 })
    .withMessage('Description must be at least 20 characters'),

  body('address').optional().custom((value) => {
    if (typeof value !== 'object') throw new APIError('Address must be an object', 400);
    const fields = ['country', 'city', 'street'];
    fields.forEach((f) => {
      if (value[f] && typeof value[f] !== 'string') throw new APIError(`${f} must be a string`, 400);
    });
    return true;
  }),

  body('propertyHighlights').optional().isArray().withMessage('PropertyHighlights must be an array')
    .custom((arr) => arr.every(item => typeof item === 'string' && item.trim() !== '' && item.length <= 50))
    .withMessage('All highlights must be non-empty strings max 50 chars'),

  body('location').optional().custom((loc) => {
    if (!loc.coordinates || !Array.isArray(loc.coordinates) || loc.coordinates.length !== 2) {
      throw new APIError('Location must have coordinates array [lng, lat]', 400);
    }
    const [lng, lat] = loc.coordinates;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new APIError('Coordinates out of range', 400);
    }
    return true;
  }),

  body('imageCover')
    .notEmpty()
    .withMessage('Cover image is required')
  ,

  body('images').optional().isArray({ max: 5 }).withMessage('Images must be an array of max 5 items'),
    // .custom((arr) => arr.every(i => typeof i === 'string' && i.trim() !== ''))
    // .withMessage('Each image must be a non-empty string'),

  body('rooms').optional().isArray()
    .custom((arr) => arr.every(i => mongoose.Types.ObjectId.isValid(i)))
    .withMessage('Rooms must be valid Mongo IDs')
    .custom((arr) => new Set(arr.map(String)).size === arr.length)
    .withMessage('Rooms array contains duplicates'),

  validatorMiddleware,
];

// Update hotel validator
export const updateHotelValidator = [
  check('id').optional(), // usually in params
  body('name').optional().isLength({ min: 2, max: 100 }).withMessage('Hotel name must be 2-100 characters'),
  body('stars').optional().isInt({ min: 1, max: 5 }).withMessage('Stars must be between 1 and 5'),
  body('description').optional().isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
  body('address').optional().custom((value) => {
    if (typeof value !== 'object') throw new APIError('Address must be an object', 400);
    const fields = ['country', 'city', 'street'];
    fields.forEach((f) => {
      if (value[f] && typeof value[f] !== 'string') throw new APIError(`${f} must be a string`, 400);
    });
    return true;
  }),
  body('propertyHighlights').optional().isArray()
    .custom((arr) => arr.every(item => typeof item === 'string' && item.trim() !== '' && item.length <= 50)),
  body('location').optional().custom((loc) => {
    if (!loc.coordinates || !Array.isArray(loc.coordinates) || loc.coordinates.length !== 2) {
      throw new APIError('Location must have coordinates array [lng, lat]', 400);
    }
    const [lng, lat] = loc.coordinates;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new APIError('Coordinates out of range', 400);
    }
    return true;
  }),
  body('images').optional().isArray({ max: 5 })
    .custom((arr) => arr.every(i => typeof i === 'string' && i.trim() !== '')),
  body('rooms').optional().isArray()
    .custom((arr) => arr.every(i => mongoose.Types.ObjectId.isValid(i)))
    .custom((arr) => new Set(arr.map(String)).size === arr.length),
  validatorMiddleware,
];

// Room type validator remains mostly the same
export const roomTypeValidator = [
  check('name').notEmpty().withMessage('RoomType name required'),
  check('price').isNumeric().withMessage('Price must be a number'),
  check('capacity').isInt().withMessage('Capacity must be an integer'),
  check('amenities').optional().isArray().withMessage('Amenities must be an array'),
  validatorMiddleware,
];

import { check } from 'express-validator';
import HotelModel from '../models/hotelModel.js';
import APIError from '../utils/apiError.js';
import { validatorMiddleware } from '../middlewares/validatorMiddleware.js';

// Create hotel validator
export const createHotelValidator = [
  check('name').notEmpty().withMessage('Hotel name required'),
  check('stars').optional().isInt({ min: 1, max: 5 }).withMessage('stars must be 1-5'),
  check('description').optional().isString(),
  check('address')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        try {
          JSON.parse(value);
        } catch (err) {
          throw new Error('address must be a JSON object');
        }
      }
      return true;
    }),
  check('propertyHighlights').optional(),
  check('location')
    .optional()
    .custom((value) => {
      // accept either object or JSON string with coordinates [lng, lat]
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (!parsed.coordinates || !Array.isArray(parsed.coordinates)) {
            throw new Error('location must have coordinates array [lng, lat]');
          }
        } catch (err) {
          throw new Error('location must be a valid JSON with coordinates');
        }
      }
      return true;
    }),
  validatorMiddleware,
];

// Update validator (partial)
export const updateHotelValidator = [
  check('id').optional(), // id is in params; handled elsewhere
  check('name').optional(),
  check('stars').optional().isInt({ min: 1, max: 5 }).withMessage('stars must be 1-5'),
  check('description').optional(),
  check('address').optional(),
  check('propertyHighlights').optional(),
  validatorMiddleware,
];

// Validate room type creation separately if you have roomType endpoints
export const roomTypeValidator = [
  check('name').notEmpty().withMessage('RoomType name required'),
  check('price').isNumeric().withMessage('price must be a number'),
  check('capacity').isInt().withMessage('capacity must be an integer'),
  validatorMiddleware,
];

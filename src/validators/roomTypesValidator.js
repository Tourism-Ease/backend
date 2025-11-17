import { check } from 'express-validator';
import mongoose from 'mongoose';
import { validatorMiddleware } from '../middlewares/validatorMiddleware.js';

export const createRoomTypeValidator = [
  check('hotel')
    .notEmpty()
    .withMessage('Hotel ID is required')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid hotel ID'),

  check('name').notEmpty().withMessage('Room type name is required'),

  check('price')
    .notEmpty()
    .withMessage('price is required')
    .isNumeric()
    .withMessage('price must be a number')
    .custom((value) => value > 0)
    .withMessage('price must be greater than 0'),

  check('capacity')
    .notEmpty()
    .withMessage('capacity is required')
    .isInt({ min: 1 })
    .withMessage('capacity must be a positive integer'),

  check('amenities').optional().isArray().withMessage('amenities must be an array of strings'),
  check('amenities.*').isString().withMessage('all amenities items must be string'), // validate each item in the array is string

  validatorMiddleware,
];
export const updateRoomTypeValidator = [
  check('id')
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid RoomType ID'),

  check('hotel')
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid hotel ID'),

  check('name').optional(),

  check('price')
    .optional()
    .isNumeric()
    .withMessage('price must be a number')
    .custom((value) => value > 0)
    .withMessage('price must be greater than 0'),

  check('capacity').optional().isInt({ min: 1 }).withMessage('capacity must be a positive integer'),

  check('amenities').optional().isArray().withMessage('amenities must be an array of strings'),
  check('amenities.*').isString(),

  validatorMiddleware,
];

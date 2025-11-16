import TripModel from '../models/tripModel.js';
import * as factory from './handlerFactory.js';

import { uploadMultipleImages } from '../middlewares/uploadImageMiddleware.js';
import { resizeMixOfImages } from '../middlewares/resizeImageMiddleware.js';
import { deleteCloudinaryImages } from '../middlewares/deleteImageMiddleware.js';

export const uploadTripImages = uploadMultipleImages([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 5 },
]);

export const resizeTripImages = resizeMixOfImages('trips', 'trip', 'imageCover', 'images');

export const deleteTripImages = deleteCloudinaryImages();

// @desc    Create a new trip
// @route   POST   /api/v1/trips
// @access  Private (Admin)
export const createTrip = factory.createOne(TripModel);

// @desc    Get all trips
// @route   GET    /api/v1/trips
// @access  Public
export const getTrips = factory.getAll(TripModel);

// @desc    Get a trip by ID
// @route   GET    /api/v1/trips/:id
// @access  Public
export const getTripById = factory.getOneById(TripModel);

// @desc    Update a trip by ID
// @route   PUT    /api/v1/trips/:id
// @access  Private (Admin)
export const updateTripById = factory.updateOneWithMultipleImages(TripModel);

// @desc    Delete a trip by ID
// @route   DELETE /api/v1/trips/:id
// @access  Private (Admin)
export const deleteTripById = factory.deleteOne(TripModel);

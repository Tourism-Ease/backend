import express from 'express';
import {
  createTrip,
  getTrips,
  getTripById,
  updateTripById,
  deleteTripById,
  uploadTripImages,
  resizeTripImages,
  deleteTripImages,
} from '../services/tripService.js';

import { sendDeleteResponse } from '../middlewares/deleteResponse.js';
import { sendUpdatedDocResponse } from '../middlewares/updateResponse.js';
import {
  createTripValidator,
  updateTripValidator,
  getTripValidator,
  deleteTripValidator,
} from '../validators/tripValidator.js';

const router = express.Router();

// GET all trips
router.get('/', getTrips);

// GET single trip
router.get('/:id', getTripValidator, getTripById);

// CREATE trip
// router.post('/', uploadTripImages, resizeTripImages, createTripValidator, createTrip);

router.post('/', uploadTripImages, resizeTripImages, createTripValidator, createTrip);

// UPDATE trip
router.patch(
  '/:id',
  uploadTripImages,
  resizeTripImages,
  updateTripValidator,
  updateTripById,
  deleteTripImages,
  sendUpdatedDocResponse
);

// DELETE trip
router.delete('/:id', deleteTripValidator, deleteTripById, deleteTripImages, sendDeleteResponse);

export default router;

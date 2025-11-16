// src/routes/hotelRoute.js
import express from 'express';
import {
  createHotel,
  getHotels,
  getHotelById,
  updateHotelById,
  deleteHotelById,
  uploadHotelImages,
  resizeHotelImages,
  deleteHotelImages,
} from '../services/hotelService.js';
import { validateLocation } from '../middlewares/hotel/validateLocation.js';
import { parseJsonFields } from '../middlewares/hotel/parseAddress.js';
import { sendDeleteResponse } from '../middlewares/deleteResponse.js';
import { sendUpdatedDocResponse } from '../middlewares/updateResponse.js';
import { validateAddress } from '../middlewares/hotel/validateAddress.js';

const router = express.Router();

// GET
router.get('/', getHotels);
router.get('/:id', getHotelById);

router.post(
  '/',
  uploadHotelImages,
  resizeHotelImages,
  parseJsonFields,
  validateLocation,
  validateAddress,
  createHotel
);

router.patch(
  '/:id',
  uploadHotelImages,
  resizeHotelImages,
  parseJsonFields,
  validateLocation,
  validateAddress,
  updateHotelById,
  deleteHotelImages,
  sendUpdatedDocResponse
);

router.delete(
  '/:id',
  deleteHotelById, // factory deleteOne sets res.locals.image/images
  deleteHotelImages, // delete images from Cloudinary
  sendDeleteResponse
);

export default router;

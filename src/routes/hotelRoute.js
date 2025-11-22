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

import { sendUpdatedDocResponse } from '../middlewares/updateResponse.js';
import { sendDeleteResponse } from '../middlewares/deleteResponse.js';

import { createHotelValidator, updateHotelValidator } from '../validators/hotelValidator.js';

const router = express.Router();

// GET
router.get('/', getHotels);
router.get('/:id', getHotelById);

router.post(
  '/',
  uploadHotelImages,
  resizeHotelImages,
  createHotelValidator,
  createHotel
);

router.patch(
  '/:id',
  uploadHotelImages,
  resizeHotelImages,
  updateHotelValidator,
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

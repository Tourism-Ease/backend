import HotelModel from '../models/hotelModel.js';
import * as factory from './handlerFactory.js';
import { deleteCloudinaryImages } from '../middlewares/deleteImageMiddleware.js';
import { uploadMultipleImages } from '../middlewares/uploadImageMiddleware.js';
import { resizeMixOfImages } from '../middlewares/resizeImageMiddleware.js';

// Images upload & resize
export const uploadHotelImages = uploadMultipleImages([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 5 },
]);

export const resizeHotelImages = resizeMixOfImages('hotels', 'hotel', 'imageCover', 'images');

export const deleteHotelImages = deleteCloudinaryImages();

// Handlers
export const createHotel = factory.createOne(HotelModel);

export const getHotels = factory.getAll(HotelModel);
export const getHotelById = factory.getOneById(HotelModel);

export const updateHotelById = factory.updateOneWithMultipleImages(
  HotelModel,
  'imageCover',
  'images'
);

export const deleteHotelById = factory.deleteOne(HotelModel, 'imageCover', 'images');

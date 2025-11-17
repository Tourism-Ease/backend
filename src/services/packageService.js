import { deleteCloudinaryImages } from '../middlewares/deleteImageMiddleware.js';
import { resizeMixOfImages } from '../middlewares/resizeImageMiddleware.js';
import { uploadMultipleImages } from '../middlewares/uploadImageMiddleware.js';
import PackageModel from '../models/packageModel.js';
import RoomTypeModel from '../models/roomTypeModel.js';
import * as factory from './handlerFactory.js';
import asyncHandler from 'express-async-handler';

export const uploadPackageImages = uploadMultipleImages([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 5 },
]);

export const resizePackageImages = resizeMixOfImages('packages', 'package', 'imageCover', 'images');
export const deletePackageImages = deleteCloudinaryImages();

export const createPackage = asyncHandler(async (req, res, next) => {
  const { basePrice, roomTypes, transportation } = req.body;

  // Transportation price
  const transportationPrice = transportation?.price || 0;

  // Set totalPrice before calling factory
  req.body.totalPrice = Number(basePrice) + transportationPrice;

  // Call the generic createOne factory
  return factory.createOne(PackageModel)(req, res, next);
});
export const getPackages = factory.getAll(PackageModel);
export const getPackageById = factory.getOneById(PackageModel);
export const updatePackageById = factory.updateOneWithMultipleImages(
  PackageModel,
  'imageCover',
  'images'
);
export const deletePackageById = factory.deleteOne(PackageModel);

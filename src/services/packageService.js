import asyncHandler from 'express-async-handler';
import PackageModel from '../models/packageModel.js';

import * as factory from './handlerFactory.js';

import { uploadMultipleImages } from '../middlewares/uploadImageMiddleware.js';
import { resizeMixOfImages } from '../middlewares/resizeImageMiddleware.js';
import { deleteCloudinaryImages } from '../middlewares/deleteImageMiddleware.js';

export const uploadPackageImages = uploadMultipleImages([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 5 },
]);

export const resizePackageImages = resizeMixOfImages('packages', 'package', 'imageCover', 'images');
export const deletePackageImages = deleteCloudinaryImages();

export const createPackage = asyncHandler(async (req, res, next) => {
  // Parse nested JSON fields coming from form-data
  if (req.body.pickupLocations) req.body.pickupLocations = JSON.parse(req.body.pickupLocations);
  if (req.body.itinerary) req.body.itinerary = JSON.parse(req.body.itinerary);
  if (req.body.packageTransportation) req.body.packageTransportation = JSON.parse(req.body.packageTransportation);


  // Call the factory function directly with req/res
  const document = await PackageModel.create(req.body);
  await document.save();

  res.status(201).json({ status: 'success', data: document });
});


export const getPackages = factory.getAll(PackageModel, [
  {
    path: 'destination',
    select: 'name' // only include name and country, exclude _id
  },
  {
    path: 'hotel',
    select: 'name stars imageCover location propertyHighlights' // include only these fields
  }
]);

export const getPackageById = factory.getOneById(PackageModel, [
  {
    path: 'destination',
    select: 'name' // only include name and country, exclude _id
  },
  {
    path: 'hotel',
    select: 'name stars imageCover location propertyHighlights' // include only these fields
  }
]);

export const updatePackageById = factory.updateOneWithMultipleImages(
  PackageModel,
  'imageCover',
  'images'
);
export const deletePackageById = factory.deleteOne(PackageModel);

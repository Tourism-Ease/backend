// src/routes/packageRoute.js
import express from 'express';

import {
  createPackage,
  getPackages,
  getPackageById,
  updatePackageById,
  deletePackageById,
  uploadPackageImages,
  resizePackageImages,
  deletePackageImages,
} from '../services/packageService.js';

import { parseJsonFields } from '../middlewares/package/parseJsonFields.js';
import { validateItinerary } from '../middlewares/package/validateItinerary.js';
import { validateTransportation } from '../middlewares/package/validateTransportation.js';

import { createPackageValidator, updatePackageValidator } from '../validators/packageValidator.js';

import { sendDeleteResponse } from '../middlewares/deleteResponse.js';
import { sendUpdatedDocResponse } from '../middlewares/updateResponse.js';

const router = express.Router();

// -----------------------------
// GET ROUTES
// -----------------------------
router.get('/', getPackages);
router.get('/:id', getPackageById);

// -----------------------------
// CREATE PACKAGE
// -----------------------------
router.post(
  '/',
  uploadPackageImages, // upload imageCover + images
  resizePackageImages, // resize & optimize
  parseJsonFields, // parse itinerary, roomTypes, transportation JSON
  validateItinerary, // validate structured array of days
  validateTransportation, // validate transport object
  createPackageValidator, // express-validator
  createPackage // factory.createOne()
);

// -----------------------------
// UPDATE PACKAGE
// -----------------------------
router.patch(
  '/:id',
  uploadPackageImages,
  resizePackageImages,
  parseJsonFields,
  validateItinerary,
  updatePackageValidator,
  updatePackageById, // factory.updateOne()
  deletePackageImages, // remove old Cloudinary images
  sendUpdatedDocResponse // unified update response
);

// -----------------------------
// DELETE PACKAGE
// -----------------------------
router.delete(
  '/:id',
  deletePackageById, // factory.deleteOne()
  deletePackageImages, // delete Cloudinary images
  sendDeleteResponse // unified delete response
);

export default router;

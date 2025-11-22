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


import { createPackageValidator, updatePackageValidator, getPackageValidator, deletePackageValidator } from '../validators/packageValidator.js';

import { sendDeleteResponse } from '../middlewares/deleteResponse.js';
import { sendUpdatedDocResponse } from '../middlewares/updateResponse.js';
import { protect, allowedTo } from '../services/authService.js';

const router = express.Router();

router.get('/', getPackages);
router.get('/:id', getPackageValidator, getPackageById);


router.use(protect);

router.use(allowedTo('admin'));


router.post(
  '/',
  uploadPackageImages,
  resizePackageImages,
  createPackageValidator,
  createPackage
);

router.patch(
  '/:id',
  uploadPackageImages,
  resizePackageImages,
  updatePackageValidator,
  updatePackageById,
  deletePackageImages,
  sendUpdatedDocResponse
);

router.delete(
  '/:id',
  deletePackageValidator,
  deletePackageById,
  deletePackageImages,
  sendDeleteResponse
);

export default router;

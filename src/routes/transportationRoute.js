import express from 'express';

// VALIDATORS
import {
  createTransportationValidator,
  getTransportationValidator,
  updateTransportationValidator,
  deleteTransportationValidator,
} from '../validators/transportationValidator.js';

// SERVICES
import {
  createTransportation,
  getTransportations,
  getTransportationById,
  updateTransportationById,
  deleteTransportationById,
} from '../services/transportationService.js';

// RESPONSE MIDDLEWARES
import { sendDeleteResponse } from '../middlewares/deleteResponse.js';

// AUTH
import { protect, allowedTo } from '../services/authService.js';

const router = express.Router();

// ------------------------------
// PUBLIC OR EMPLOYEE-AUTH ROUTES
// ------------------------------
router.get('/', getTransportations);

router.get('/:id', getTransportationValidator, getTransportationById);

// router.use(protect);

// ------------------------------
// ADMIN ROUTES
// ------------------------------
// router.use(allowedTo('admin'));

router.post('/', createTransportationValidator, createTransportation);

router.patch('/:id', updateTransportationValidator, updateTransportationById);

router.delete('/:id', deleteTransportationValidator, deleteTransportationById, sendDeleteResponse);

export default router;

import express from 'express';
import {
  createDestination,
  getDestinations,
  getDestinationById,
  updateDestinationById,
  deleteDestinationById,
} from '../services/destinationService.js';

import {
  createDestinationValidator,
  updateDestinationValidator,
} from '../validators/destinationValidator.js';

import { sendUpdatedDocResponse } from '../middlewares/updateResponse.js';
import { sendDeleteResponse } from '../middlewares/deleteResponse.js';

const router = express.Router();

// -------- GET --------
router.get('/', getDestinations);
router.get('/:id', getDestinationById);

// -------- CREATE --------
router.post('/', createDestinationValidator, createDestination);

// -------- UPDATE --------
router.patch('/:id', updateDestinationValidator, updateDestinationById, sendUpdatedDocResponse);

// -------- DELETE --------
router.delete('/:id', deleteDestinationById, sendDeleteResponse);

export default router;

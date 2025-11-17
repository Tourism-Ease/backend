import express from 'express';
import {
  createRoomType,
  getRoomTypes,
  getRoomTypeById,
  updateRoomTypeById,
  deleteRoomTypeById,
} from '../services/roomTypeService.js';
import { sendDeleteResponse } from '../middlewares/deleteResponse.js';
import {
  createRoomTypeValidator,
  updateRoomTypeValidator,
} from '../validators/roomTypesValidator.js';

const router = express.Router({ mergeParams: true });

// ==================== GET Routes ====================
router.get('/', getRoomTypes);
router.get('/:id', getRoomTypeById);

// ==================== POST Routes ====================
router.post('/', createRoomTypeValidator, createRoomType);

// ==================== PATCH Routes ====================
router.patch('/:id', updateRoomTypeValidator, updateRoomTypeById);

// ==================== DELETE Routes ====================
router.delete('/:id', deleteRoomTypeById, sendDeleteResponse);

export default router;

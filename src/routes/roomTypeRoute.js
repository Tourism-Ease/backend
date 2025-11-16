import express from 'express';
import {
  createRoomType,
  getRoomTypes,
  getRoomTypeById,
  updateRoomTypeById,
  deleteRoomTypeById,
} from '../services/roomTypeService.js';
import { sendDeleteResponse } from '../middlewares/deleteResponse.js';

const router = express.Router({ mergeParams: true });

// ==================== GET Routes ====================
router.get('/', getRoomTypes);
router.get('/:id', getRoomTypeById);

// ==================== POST Routes ====================
router.post('/', createRoomType);

// ==================== PATCH Routes ====================
router.patch('/:id', updateRoomTypeById);

// ==================== DELETE Routes ====================
router.delete('/:id', deleteRoomTypeById, sendDeleteResponse);

export default router;

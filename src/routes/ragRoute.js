import express from 'express';
import {
  getFaqs,
  createFaq,
  getFaqById,
  updateFaqById,
  deleteFaqById,
} from '../services/faqCrudService.js';
import { chatHandler } from '../services/ragService.js';
import { getAllMiddleware } from '../middlewares/getAllMiddleware.js';

const router = express.Router();
// Public
router.get('/', getAllMiddleware(getFaqs));

// router.post('/chat', ragController.chat);
router.post('/ask', chatHandler);

router.get('/:id', getFaqById);
// Admin (protect with auth middleware in real app)
router.post('/', createFaq);
router.patch('/:id', updateFaqById);
router.delete('/:id', deleteFaqById);

export default router;

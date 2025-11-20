import express from 'express';
import {
  getFaqs,
  createFaq,
  getFaqById,
  updateFaqById,
  deleteFaqById,
} from '../services/faqCrudService.js';
// import { askFAQEndpoint } from '../services/faq.controller.js';
import * as ragController from '../services/rag.controller.js';
const router = express.Router();
// Public
router.get('/', getFaqs);
router.post('/chat', ragController.chat);
// Admin (protect with auth middleware in real app)
router.post('/', createFaq);
router.patch('/:id', updateFaqById);
router.delete('/:id', deleteFaqById);

export default router;

import express from 'express';
// import { protect, restrictTo } from '../utils/auth.js';
import { getDashboardData } from '../middlewares/getDashboardData.js';

const router = express.Router();

router.get(
  '/',
  // protect, restrictTo('admin'),
  getDashboardData
);

export default router;

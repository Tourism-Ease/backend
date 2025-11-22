import { DashboardService } from '../services/dashboardService.js';

export const getDashboardData = async (req, res, next) => {
  try {
    const data = await DashboardService.getAllDashboardData();
    res.status(200).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

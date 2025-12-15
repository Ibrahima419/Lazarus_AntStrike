/**
 * 📊 Dashboard Routes
 */

import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';

const router = Router();

// Accessible by any authenticated user (Analyst or Admin)
router.get('/analyst', DashboardController.getAnalystDashboard);

export default router;

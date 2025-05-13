import express from 'express';
import { getDashboardTasks } from '../controllers/tasks.controller.js';

const router = express.Router();

router.get('/dashboard-tasks', getDashboardTasks);

export default router;

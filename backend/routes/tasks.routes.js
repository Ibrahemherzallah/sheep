import express from 'express';
import {
    getDashboardTasks,
    getInjectionTasks,
    getNextInjectionTaskForSheep, getUpcomingInjectionTasksForCycle
} from '../controllers/tasks.controller.js';

const router = express.Router();

router.get('/dashboard-tasks', getDashboardTasks);
router.get('/injections-tasks', getInjectionTasks);
router.get('/next-injection/:sheepId', getNextInjectionTaskForSheep);
router.get('/next-injection-cycle/:id', getUpcomingInjectionTasksForCycle);

export default router;

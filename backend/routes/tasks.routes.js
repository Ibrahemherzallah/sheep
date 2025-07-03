import express from 'express';
import {
    createTask,
    getDashboardTasks,
    getInjectionTasks,
    getNextInjectionTaskForSheep, getUpcomingInjectionTasksForCycle, markTaskComplete
} from '../controllers/tasks.controller.js';
import {authenticate} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get('/dashboard-tasks', getDashboardTasks);
router.get('/injections-tasks', getInjectionTasks);
router.get('/next-injection/:sheepId', getNextInjectionTaskForSheep);
router.get('/next-injection-cycle/:id', getUpcomingInjectionTasksForCycle);
router.post('/', createTask);
router.put('/:id/complete', markTaskComplete);

export default router;

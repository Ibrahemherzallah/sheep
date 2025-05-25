import express from 'express';
import {getDashboardTasks, getInjectionTasks, getNextInjectionTaskForSheep} from '../controllers/tasks.controller.js';

const router = express.Router();

router.get('/dashboard-tasks', getDashboardTasks);
router.get('/injections-tasks', getInjectionTasks);
router.get('/next-injection/:sheepId', getNextInjectionTaskForSheep);

export default router;

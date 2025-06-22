import express from 'express';
import {getAllCycles, getCycleById, updateCycle, deleteCycle, createReport, endCycle, createCycle, addInjectionToCycle, getReportsByCycleId}
from '../controllers/cycle.controller.js';
import {authenticate} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/', authenticate, createCycle);
router.get('/', getAllCycles);
router.get('/reports/:cycleId', getReportsByCycleId);
router.post('/cycle-injections', authenticate, addInjectionToCycle);
router.post('/cycle-end', authenticate, endCycle);
router.post('/report', authenticate, createReport);
router.get('/:id', getCycleById);
router.put('/:id', authenticate, updateCycle);
router.delete('/:id', authenticate, deleteCycle);

export default router;

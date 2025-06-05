import express from 'express';
import {getAllCycles, getCycleById, updateCycle, deleteCycle, createReport, endCycle, createCycle, addInjectionToCycle, getReportsByCycleId}
from '../controllers/cycle.controller.js';

const router = express.Router();

router.post('/', createCycle);
router.get('/', getAllCycles);
router.get('/reports/:cycleId', getReportsByCycleId);
router.post('/cycle-injections', addInjectionToCycle);
router.post('/cycle-end', endCycle);
router.post('/report', createReport);
router.get('/:id', getCycleById);
router.put('/:id', updateCycle);
router.delete('/:id', deleteCycle);

export default router;

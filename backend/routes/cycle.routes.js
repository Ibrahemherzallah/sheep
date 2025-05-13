import express from 'express';
import {
    createCycle,
    getAllCycles,
    getCycleById,
    updateCycle,
    deleteCycle,
    createReport, endCycle
} from '../controllers/cycle.controller.js';

const router = express.Router();

router.post('/', createCycle);
router.post('/cycle-end', endCycle);
router.post('/report', createReport);
router.get('/', getAllCycles);
router.get('/:id', getCycleById);
router.put('/:id', updateCycle);
router.delete('/:id', deleteCycle);

export default router;

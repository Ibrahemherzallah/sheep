import express from 'express';
import {
    getAllCycles,
    getCycleById,
    updateCycle,
    deleteCycle,
    createReport,
    endCycle,
    createCycle,
    addInjectionToCycle,
    getReportsByCycleId,
    addSheepToCycle
}
    from '../controllers/cycle.controller.js';
import {authenticate} from "../middleware/authMiddleware.js";
import {getCyclesWithInventories} from "../controllers/inventory.controller.js";

const router = express.Router();

router.post('/', authenticate, createCycle);
router.get('/', getAllCycles);
router.get('/reports/:cycleId', getReportsByCycleId);
router.post('/cycle-injections', authenticate, addInjectionToCycle);
router.post('/cycle-end', authenticate, endCycle);
router.post('/report', authenticate, createReport);
router.post("/add-sheep/:cycleId",authenticate, addSheepToCycle);
router.get('/:id', getCycleById);
router.put('/:id', authenticate, updateCycle);
router.delete('/:id', authenticate, deleteCycle);

export default router;

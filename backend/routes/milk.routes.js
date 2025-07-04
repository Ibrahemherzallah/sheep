import express from 'express';
import {
    createMilkRecord,
    getAllMilkRecords,
    updateMilkRecord,
    deleteMilkRecord,
    getMilkYearlySummary,
} from '../controllers/milk.controller.js';
import {authenticate} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/', authenticate, createMilkRecord);
router.get('/', getAllMilkRecords);
router.put('/:id', authenticate, updateMilkRecord);
router.delete('/:id', authenticate, deleteMilkRecord);
router.get('/summary', getMilkYearlySummary);

export default router;

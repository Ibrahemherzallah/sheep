import express from 'express';
import {createMilkRecord, getAllMilkRecords, updateMilkRecord, deleteMilkRecord,} from '../controllers/milk.controller.js';

const router = express.Router();

router.post('/', createMilkRecord);
router.get('/', getAllMilkRecords);
router.put('/:id', updateMilkRecord);
router.delete('/:id', deleteMilkRecord);

export default router;

import express from 'express';
import {
    createPregnancies,
    getAllPregnancies,
    getPregnancyById,
    updateLastPregnanciesAfterBirth,
    updateMilkInfo,
    deletePregnancy,
    updateOnePregnancy,
    updateEndMilkInfo,
    updateMilkAmountOnly
} from '../controllers/pregnancy.controller.js';

const router = express.Router();

router.post('/bulk', createPregnancies);
router.get('/', getAllPregnancies);
router.put('/update-after-birth', updateLastPregnanciesAfterBirth);
router.put('/update-milk', updateMilkInfo);
router.put("/update-end-milk", updateEndMilkInfo);
router.put('/update-milk-amount', updateMilkAmountOnly);
router.get('/:id', getPregnancyById);
router.put('/:id', updateOnePregnancy);
router.delete('/:id', deletePregnancy);

export default router;

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
import {authenticate} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/bulk', authenticate, createPregnancies);
router.get('/', getAllPregnancies);
router.put('/update-after-birth', authenticate, updateLastPregnanciesAfterBirth);
router.put('/update-milk', authenticate, updateMilkInfo);
router.put("/update-end-milk", authenticate, updateEndMilkInfo);
router.put('/update-milk-amount', authenticate, updateMilkAmountOnly);
router.get('/:id', getPregnancyById);
router.put('/:id', authenticate, updateOnePregnancy);
router.delete('/:id', authenticate, deletePregnancy);

export default router;

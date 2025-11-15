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
    updateMilkAmountOnly, updatePregnancyDates, getTotalBornLambs, getTotalAliveLambs, getTotalDeadLambs,getMonthlySummary,getYearlySummary
} from '../controllers/pregnancy.controller.js';
import {authenticate} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/bulk', authenticate, createPregnancies);
router.put("/:pregnancyId/update-dates", updatePregnancyDates);
router.get('/', getAllPregnancies);
router.get("/total-born", getTotalBornLambs);
router.get("/total-alive", getTotalAliveLambs);
router.get("/total-dead", getTotalDeadLambs);
router.get("/summary/monthly", getMonthlySummary);
router.get("/summary/yearly", getYearlySummary);
router.put('/update-after-birth', authenticate, updateLastPregnanciesAfterBirth);
router.put('/update-milk', authenticate, updateMilkInfo);
router.put("/update-end-milk", authenticate, updateEndMilkInfo);
router.put('/update-milk-amount', authenticate, updateMilkAmountOnly);
router.get('/:id', getPregnancyById);
router.put('/:id', authenticate, updateOnePregnancy);
router.delete('/:id', authenticate, deletePregnancy);

export default router;

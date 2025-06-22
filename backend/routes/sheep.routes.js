import express from "express";
import {
    createSheep,
    getAllSheep,
    getSheepById,
    updateSheep,
    deleteSheep,
    updateSheepStatus, getSheepInjectionHistory, getLatestPatientCasesForSickSheep, getListSheepById
} from "../controllers/sheep.controller.js";
import {authenticate} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/', authenticate, createSheep);
router.get('/', getAllSheep);
router.get('/latest-patient-cases', getLatestPatientCasesForSickSheep);
router.post('/list-by-ids', authenticate, getListSheepById);
router.get('/:id/injection-history', getSheepInjectionHistory);
router.put('/:id/status', authenticate, updateSheepStatus);
router.delete('/:id', authenticate, deleteSheep);
router.get('/:id', getSheepById);
router.put('/:id', authenticate, updateSheep);

export default router;
import express from "express";
import {
    createSheep,
    getAllSheep,
    getSheepById,
    updateSheep,
    deleteSheep,
    updateSheepStatus, getSheepInjectionHistory, getLatestPatientCasesForSickSheep
} from "../controllers/sheep.controller.js";

const router = express.Router();

router.post('/', createSheep);
router.get('/', getAllSheep);
router.get('/latest-patient-cases', getLatestPatientCasesForSickSheep);
router.get('/:id/injection-history', getSheepInjectionHistory);
router.put('/:id/status', updateSheepStatus);
router.delete('/:id', deleteSheep);
router.get('/:id', getSheepById);
router.put('/:id', updateSheep);

export default router;
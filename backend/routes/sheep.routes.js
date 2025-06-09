import express from "express";
import {
    createSheep,
    getAllSheep,
    getSheepById,
    updateSheep,
    deleteSheep,
    updateSheepStatus, getSheepInjectionHistory, getLatestPatientCasesForSickSheep, getListSheepById
} from "../controllers/sheep.controller.js";

const router = express.Router();

router.post('/', createSheep);
router.get('/', getAllSheep);
router.get('/latest-patient-cases', getLatestPatientCasesForSickSheep);
router.get('/list-by-ids', getListSheepById);
router.get('/:id/injection-history', getSheepInjectionHistory);
router.put('/:id/status', updateSheepStatus);
router.delete('/:id', deleteSheep);
router.get('/:id', getSheepById); // <-- move to the bottom
router.put('/:id', updateSheep);  // <-- move to the bottom

export default router;
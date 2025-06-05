import express from 'express';
import {
    createVitamin, getVitamins, updateVitamin, deleteVitamin,
    createDrugType, getAllDrugTypes, getDrugTypeById, updateDrugType,deleteDrugType,
    createInjection, getInjections, updateInjection, deleteInjection
} from '../controllers/supplement.controller.js';

const router = express.Router();

// Vitamins
router.post('/vitamins', createVitamin);
router.get('/vitamins', getVitamins);
router.put('/vitamins/:id', updateVitamin);
router.delete('/vitamins/:id', deleteVitamin);

// Drugs
router.post('/drug', createDrugType);
router.get('/drug', getAllDrugTypes);
router.get('/drug/:id', getDrugTypeById);
router.put('/drug/:id', updateDrugType);
router.delete('/drug/:id', deleteDrugType);

// Injections
router.post('/injections', createInjection);
router.get('/injections', getInjections);
router.put('/injections/:id', updateInjection);
router.delete('/injections/:id', deleteInjection);

export default router;
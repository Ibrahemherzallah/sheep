import express from 'express';
import {
    createVitamin, getVitamins, updateVitamin, deleteVitamin,
    createDrugType, getAllDrugTypes, getDrugTypeById, updateDrugType,deleteDrugType,
    createInjection, getInjections, updateInjection, deleteInjection
} from '../controllers/supplement.controller.js';
import {authenticate} from "../middleware/authMiddleware.js";

const router = express.Router();

// Vitamins
router.post('/vitamins', authenticate, createVitamin);
router.get('/vitamins', getVitamins);
router.put('/vitamins/:id', authenticate, updateVitamin);
router.delete('/vitamins/:id', authenticate, deleteVitamin);

// Drugs
router.post('/drug', authenticate, createDrugType);
router.get('/drug', getAllDrugTypes);
router.get('/drug/:id', getDrugTypeById);
router.put('/drug/:id', authenticate, updateDrugType);
router.delete('/drug/:id', authenticate, deleteDrugType);

// Injections
router.post('/injections', authenticate, createInjection);
router.get('/injections', getInjections);
router.put('/injections/:id', authenticate, updateInjection);
router.delete('/injections/:id', authenticate, deleteInjection);

export default router;
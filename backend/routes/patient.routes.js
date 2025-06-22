import express from 'express';
import {
    createPatient,
    getAllPatients,
    getPatientById,
    updatePatient,
    deletePatient, addDrugToLatestPatient
} from '../controllers/patient.controller.js';
import {authenticate} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/', authenticate, createPatient);
router.get('/', getAllPatients);
router.put('/add-drug/:sheepId', authenticate, addDrugToLatestPatient);
router.get('/:id', getPatientById);
router.put('/:id', authenticate, updatePatient);
router.delete('/:id', authenticate, deletePatient);

export default router;

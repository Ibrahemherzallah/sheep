import express from 'express';
import {
    createPatient,
    getAllPatients,
    getPatientById,
    updatePatient,
    deletePatient, addDrugToLatestPatient
} from '../controllers/patient.controller.js';

const router = express.Router();

router.post('/', createPatient);
router.get('/', getAllPatients);
router.put('/add-drug/:sheepId', addDrugToLatestPatient);
router.get('/:id', getPatientById);
router.put('/:id', updatePatient);
router.delete('/:id', deletePatient);

export default router;

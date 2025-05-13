import express from 'express';
import {
    createPregnancies, getAllPregnancies, getPregnancyById,
    updateLastPregnanciesAfterBirth, deletePregnancy, updateOnePregnancy
} from '../controllers/pregnancy.controller.js';

const router = express.Router();

router.post('/bulk', createPregnancies);
router.get('/', getAllPregnancies);
router.get('/:id', getPregnancyById);
router.put('/:id', updateOnePregnancy);
router.put('/update-after-birth', updateLastPregnanciesAfterBirth);
router.delete('/:id', deletePregnancy);

export default router;

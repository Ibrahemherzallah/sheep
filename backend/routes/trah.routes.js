import express from 'express';
import {addTrahCases, deleteTrahCase, getTrahTotals} from '../controllers/trah.controller.js';
import {authenticate} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/add', addTrahCases);
router.delete('/delete/:trahId', authenticate, deleteTrahCase);
router.get("/totals", getTrahTotals);

export default router;

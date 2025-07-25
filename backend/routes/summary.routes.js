// routes/authRoutes.js
import express from 'express';
import {getMonthlySummary, getYearlySummary} from "../controllers/summary.contoller.js";

const router = express.Router();
router.get('/monthly-summary', getMonthlySummary);
router.get('/yearly-summary', getYearlySummary);


export default router;

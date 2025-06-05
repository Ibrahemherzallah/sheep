import express from 'express';
import {cycleDashboard, dashboard, medicalDashboard} from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get('/summary', dashboard);
router.get('/summary-medical', medicalDashboard);
router.get('/summary-cycle', cycleDashboard);

export default router;
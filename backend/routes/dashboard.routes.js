import express from 'express';
import {dashboard} from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get('/summary', dashboard);

export default router;
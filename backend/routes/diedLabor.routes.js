import express from "express";
import { addDiedLabor, getDiedLaborsByCycle, getDiedTotals } from "../controllers/diedLabor.controller.js";

const router = express.Router();

router.post("/add", addDiedLabor);
router.get("/:cycleId", getDiedLaborsByCycle);
router.get("/:cycleId/totals", getDiedTotals);

export default router;

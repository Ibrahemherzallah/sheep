import express from "express";
import {createSheep,getAllSheep,getSheepById,updateSheep,deleteSheep} from "../controllers/sheep.controller.js";

const router = express.Router();

router.post('/', createSheep);
router.get('/', getAllSheep);
router.get('/:id', getSheepById);
router.put('/:id', updateSheep);
router.delete('/:id', deleteSheep);

export default router;
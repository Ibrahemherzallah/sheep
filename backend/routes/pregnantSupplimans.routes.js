import express from "express";
import {editSupplimants} from "../controllers/pregnantSupplimans.controller.js";
const router = express.Router();

router.put('/:id', editSupplimants); // use PUT for updates
export default router;
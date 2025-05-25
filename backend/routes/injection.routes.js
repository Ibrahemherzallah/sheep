import express from 'express';
import {createInjection, getInjection} from "../controllers/injection.controller.js";

const router = express.Router();

router.get('/',getInjection)
router.post('/',createInjection)

export default router;



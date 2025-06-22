import express from 'express';
import {createInjection, getInjection} from "../controllers/injection.controller.js";
import {authenticate} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get('/',getInjection)
router.post('/', authenticate,createInjection)

export default router;



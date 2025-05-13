import express from 'express';
import {login, register, updateProfile} from "../controllers/auth.controller.js";
import {protect} from "../middleware/auth.js";

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.put('/profile', protect, updateProfile);

export default router;
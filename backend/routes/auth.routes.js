// routes/authRoutes.js
import express from 'express';
import {changePassword, login, updateUser} from '../controllers/auth.controller.js';
import {authenticate} from "../middleware/authMiddleware.js";

const router = express.Router();
router.post('/login', login);
router.put('/update', authenticate, updateUser);
router.put("/change-password", authenticate, changePassword);

export default router;


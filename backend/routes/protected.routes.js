// routes/protectedRoutes.js
import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/secret-data', authenticate, (req, res) => {
    res.json({ message: `This is protected data for user ${req.userId}` });
});

export default router;

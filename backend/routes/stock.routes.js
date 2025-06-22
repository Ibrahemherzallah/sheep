import express from 'express';
import {addStockQuantity, createStockItem, getAllStockItems, getStockType} from '../controllers/stock.controller.js';
import {authenticate} from "../middleware/authMiddleware.js";

const router = express.Router();


router.get('/category/:type',getStockType);
router.get('/', getAllStockItems);
router.post('/add', authenticate, createStockItem);
router.put('/add-quantity', authenticate, addStockQuantity);

export default router;
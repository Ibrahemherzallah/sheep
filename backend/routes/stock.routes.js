import express from 'express';
import {addStockQuantity, createStockItem, getAllStockItems, getStockType} from '../controllers/stock.controller.js';

const router = express.Router();


router.get('/category/:type',getStockType);
router.get('/', getAllStockItems);
router.post('/add', createStockItem);
router.put('/add-quantity', addStockQuantity);

export default router;
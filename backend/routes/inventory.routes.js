import express from 'express';
import {
    createInventory,
    getInventory,
    deleteInventory, addSale, addExpense
} from '../controllers/inventory.controller.js';

const router = express.Router();

router.post('/', createInventory);
router.get('/', getInventory);
router.delete('/:id', deleteInventory);
router.post('/sales/add',addSale)
router.post('/expense/add',addExpense)

export default router;

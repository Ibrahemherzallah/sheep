import express from 'express';
import {
    createInventory,
    getInventory,
    deleteInventory,
    addSale,
    addExpense,
    getCyclesWithInventories,
    addCycleInventory,
    addCycleSale,
    addCycleExpense,
    addRetroactiveMonth, deleteRecord
} from '../controllers/inventory.controller.js';

const router = express.Router();

router.post('/', createInventory);
router.get('/', getInventory);
router.get('/cycles-with-inventories', getCyclesWithInventories);
router.post('/add-cycle-inventory', addCycleInventory);
router.post('/finance/retroactive', addRetroactiveMonth);
router.delete('/delete-month', deleteRecord); // 👈 place this BEFORE dynamic `/:id`
router.post('/sales/add', addSale);
router.post('/expense/add', addExpense);
router.post('/sales-cycle/add', addCycleSale);
router.post('/expense-cycle/add', addCycleExpense);
router.delete('/:id', deleteInventory); // 👈 move this last


export default router;

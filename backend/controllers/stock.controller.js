import StockModel from '../models/stock.model.js';



export const getStockType = async (req, res) => {
    const { type } = req.params;
    try {
        const items = await StockModel.find({ type });
        res.json(items);
    }
    catch (err) {
        res.status(500).json({ message: 'فشل في جلب العناصر' });
    }
};

export const createStockItem = async (req, res) => {
    try {
        const { type, name, quantity, section, unit, notes } = req.body;

        // Check if item with same name, type, and section already exists
        const existingItem = await StockModel.findOne({
            name,
            type,
            section,
        });

        if (existingItem) {
            return res.status(400).json({ error: 'هذا العنصر موجود بالفعل في هذا القسم' });
        }

        const newStock = new StockModel({type, name, quantity, section, unit, notes,});
        await newStock.save();

        res.status(201).json(newStock);
    } catch (error) {
        console.error('Failed to create stock item:', error);
        res.status(500).json({ error: 'حدث خطأ أثناء إضافة العنصر' });
    }
};


export const addStockQuantity = async (req, res) => {
    const { itemId, quantity } = req.body;

    if (!itemId || typeof quantity !== 'number') {
        return res.status(400).json({ message: 'Invalid item ID or quantity' });
    }

    try {
        const stockItem = await StockModel.findById(itemId);

        if (!stockItem) {
            return res.status(404).json({ message: 'Item not found' });
        }

        stockItem.quantity += quantity;
        await stockItem.save();

        res.json(stockItem);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating item quantity' });
    }
};

export const getAllStockItems = async (req, res) => {
    try {
        const items = await StockModel.find().sort({ createdAt: -1 }); // sorted by newest first
        res.json(items);
    } catch (error) {
        console.error('Error fetching stock items:', error);
        res.status(500).json({ message: 'حدث خطأ أثناء جلب عناصر المخزون' });
    }
};
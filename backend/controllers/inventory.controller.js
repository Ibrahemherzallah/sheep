import Inventory from '../models/inventory.model.js';
import Income from '../models/income.model.js';
import Outcome from '../models/outcome.model.js';

export const createInventory = async (req, res) => {
    console.log("TEST  " ,req.body);
    try {
        const { name, quantity, price, result } = req.body;

        // 1. Create the Inventory item
        const newInventory = new Inventory({
            type: name,
            quantity,
            price,
            category: result, // 'income' or 'outcome'
        });

        await newInventory.save();

        // 2. Get current month and year
        const now = new Date();
        const month = now.getMonth() + 1; // Month is 0-indexed
        const year = now.getFullYear();

        // 3. Prepare resource object to insert
        const resourceEntry = {
            item: newInventory._id,
            price: price,
        };

        if (result === 'income') {
            let incomeDoc = await Income.findOne({ month, year });

            if (!incomeDoc) {
                // Create new income document
                incomeDoc = new Income({
                    month,
                    year,
                    resources: [resourceEntry],
                    totalCost: price,
                });
            } else {
                incomeDoc.resources.push(resourceEntry);
                incomeDoc.totalCost += price;
            }

            await incomeDoc.save();
        } else if (result === 'outcome') {
            let outcomeDoc = await Outcome.findOne({ month, year });

            if (!outcomeDoc) {
                // Create new outcome document
                outcomeDoc = new Outcome({
                    month,
                    year,
                    resources: [resourceEntry],
                    totalCost: price,
                });
            } else {
                outcomeDoc.resources.push(resourceEntry);
                outcomeDoc.totalCost += price;
            }

            await outcomeDoc.save();
        }

        return res.status(201).json({ message: 'Inventory item created and added to monthly report.' });
    } catch (err) {
        console.error('Error creating inventory:', err);
        return res.status(500).json({ message: 'Server error.' });
    }
};


// Get all inventory items (optional filtering)
export const getInventory = async (req, res) => {
    try {
        const items = await Inventory.find().sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete an item (if needed)
export const deleteInventory = async (req, res) => {
    try {
        const { id } = req.params;
        await Inventory.findByIdAndDelete(id);
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const addSale = async (req, res) => {
    try {
        const { selectedItemId, quantity, price } = req.body;
        console.log("itemId",selectedItemId)
        const inventoryItem = await Inventory.findById(selectedItemId);
        console.log("inventoryItem",inventoryItem)
        if (!inventoryItem || inventoryItem.category !== 'income') {
            return res.status(400).json({ message: 'Invalid item or not income category' });
        }

        // Update inventory
        inventoryItem.quantity += quantity;
        inventoryItem.price += price;
        await inventoryItem.save();

        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        let income = await Income.findOne({ month, year });
        if (!income) {
            income = new Income({
                month,
                year,
                resources: [],
                totalCost: 0,
            });
        }

        // Check if the item already exists in resources
        const existingResource = income.resources.find(resource =>
            resource.item.toString() === inventoryItem._id.toString()
        );

        if (existingResource) {
            existingResource.price += price; // update existing
        } else {
            income.resources.push({
                item: inventoryItem._id,
                price,
            });
        }

        income.totalCost += price;

        await income.save();

        res.status(200).json({ message: 'Sale added and inventory/income updated.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};


export const addExpense = async (req, res) => {
    try {
        const { selectedItemId, quantity, price } = req.body;
        console.log("itemId",selectedItemId)
        const inventoryItem = await Inventory.findById(selectedItemId);
        console.log("inventoryItem",inventoryItem)
        if (!inventoryItem || inventoryItem.category !== 'outcome') {
            return res.status(400).json({ message: 'Invalid item or not income category' });
        }

        // Update inventory
        inventoryItem.quantity += quantity;
        inventoryItem.price += price;
        await inventoryItem.save();

        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        let outcome = await Outcome.findOne({ month, year });
        if (!outcome) {
            outcome = new Outcome({
                month,
                year,
                resources: [],
                totalCost: 0,
            });
        }

        // Check if the item already exists in resources
        const existingResource = outcome.resources.find(resource => {
            console.log("resource is : " ,resource)
            console.log("resource is" ,inventoryItem)
            return resource.item.toString() === inventoryItem._id.toString()
            }
        );

        console.log("existingResource existingResource is : " , existingResource)

        console.log("existingResource before is : " , existingResource.price)
        if (existingResource) {
            existingResource.price += price; // update existing

            console.log("existingResource after  is : " , existingResource.price)
        } else {
            outcome.resources.push({
                item: inventoryItem._id,
                price,
            });
        }

        outcome.totalCost += price;

        await outcome.save();

        res.status(200).json({ message: 'Expens added and inventory/outcome updated.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
import Inventory from '../models/inventory.model.js';
import Income from '../models/income.model.js';
import Outcome from '../models/outcome.model.js';
import Cycle from '../models/cycle.model.js';
import CycleInventory from '../models/cycleInventory.js';


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

export const getInventory = async (req, res) => {
    try {
        const items = await Inventory.find().sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

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


export const addCycleSale = async (req, res) => {
    try {
        const { selectedItemId, quantity, price } = req.body;
        console.log("itemId",selectedItemId)
        const cycleInventory = await CycleInventory.findById(selectedItemId);
        console.log("inventoryItem",cycleInventory)
        if (!cycleInventory || cycleInventory.category !== 'income') {
            return res.status(400).json({ message: 'Invalid item or not income category' });
        }

        // Update inventory
        cycleInventory.quantity += quantity;
        cycleInventory.price += price;
        await cycleInventory.save();
        res.status(200).json({ message: 'Sale added and inventory/income updated.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const addCycleExpense = async (req, res) => {
    try {
        const { selectedItemId, quantity, price } = req.body;
        console.log("itemId",selectedItemId)
        const cycleInventory = await CycleInventory.findById(selectedItemId);
        console.log("inventoryItem",cycleInventory)
        if (!cycleInventory || cycleInventory.category !== 'outcome') {
            return res.status(400).json({ message: 'Invalid item or not income category' });
        }

        // Update inventory
        cycleInventory.quantity += quantity;
        cycleInventory.price += price;
        await cycleInventory.save();

        res.status(200).json({ message: 'Expens added and inventory/outcome updated.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};



export const getCyclesWithInventories = async (req, res) => {
    console.log("ENTER");
    try {
        const cycles = await Cycle.find().sort({ createdAt: -1 });

        const result = await Promise.all(cycles.map(async (cycle) => {
            const inventories = await CycleInventory.find({ cycleId: cycle._id });

            const income = inventories.filter(inv => inv.category === 'income');
            const outcome = inventories.filter(inv => inv.category === 'outcome');

            return {
                cycle,
                income,
                outcome
            };
        }));

        res.status(200).json(result);
    } catch (err) {
        console.error("Error fetching cycles with inventories:", err);
        res.status(500).json({ error: "Failed to fetch data" });
    }
};

export const addCycleInventory = async (req, res) => {
    try {
        const { name, quantity, price, cycleId, result } = req.body;

        const newItem = new CycleInventory({
            type: name,
            quantity,
            price,
            cycleId,
            category: result,
        });

        await newItem.save();
        res.status(201).json({ message: 'Cycle inventory item added', item: newItem });
    } catch (error) {
        console.error('Error adding cycle inventory:', error);
        res.status(500).json({ message: 'Failed to add cycle inventory item' });
    }
};

// POST /api/finance/retroactive
export const addRetroactiveMonth = async (req, res) => {
    try {
        const { month, year, resources } = req.body;

        // Group resources by category
        const incomeResources = resources
            .filter(r => r.category === 'income')
            .map(r => ({
                item: r.itemId,
                price: r.price
            }));

        const outcomeResources = resources
            .filter(r => r.category === 'outcome')
            .map(r => ({
                item: r.itemId,
                price: r.price
            }));

        // Calculate total costs
        const totalIncome = incomeResources.reduce((sum, r) => sum + r.price, 0);
        const totalOutcome = outcomeResources.reduce((sum, r) => sum + r.price, 0);

        // Create Income record if needed
        if (incomeResources.length > 0) {
            await Income.create({
                month,
                year,
                resources: incomeResources,
                totalCost: totalIncome
            });
        }

        // Create Outcome record if needed
        if (outcomeResources.length > 0) {
            await Outcome.create({
                month,
                year,
                resources: outcomeResources,
                totalCost: totalOutcome
            });
        }

        res.status(200).json({ message: 'تمت الإضافة بنجاح' });
    } catch (error) {
        console.error('Error in addRetroactiveFinance:', error);
        res.status(500).json({ message: 'حدث خطأ أثناء إضافة البيانات' });
    }
};


export const deleteRecord = async (req, res) => {
    console.log("ENTER")
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({ message: 'Month and year are required.' });
        }

        const incomeResult = await Income.deleteMany({ month: Number(month), year: Number(year) });
        const outcomeResult = await Outcome.deleteMany({ month: Number(month), year: Number(year) });

        return res.status(200).json({
            message: 'Deleted records successfully',
            incomeDeleted: incomeResult.deletedCount,
            outcomeDeleted: outcomeResult.deletedCount,
        });
    } catch (error) {
        console.error('Error deleting monthly summary:', error);
        res.status(500).json({ message: 'Server error during deletion.' });
    }
}
import MilkProduction from '../models/milkProduction.model.js';
import Inventory from '../models/inventory.model.js';
import Income from '../models/income.model.js';
import Task from '../models/task.model.js';

export const createMilkRecord = async (req, res) => {
    console.log("entered here is  : ",req.body);
    try {
        const { date, production, sold, price } = req.body;

        // 1. Create the milk record
        const record = await MilkProduction.create({ date, production, sold, price });

        // 2. Find inventory item for milk (assumes name is "حليب")
        const milkInventory = await Inventory.findOne({ type: 'حليب', category: 'income' });
        if (!milkInventory) {
            return res.status(400).json({ error: 'لم يتم العثور على عنصر الحليب في الجرد' });
        }

        // 3. Update milk inventory: add sold quantity and revenue

        const quantity = Number(milkInventory.quantity);
        const soldAmount = Number(sold);
        const unitPrice = Number(price);
        const revenue = soldAmount * unitPrice
        console.log("quantity is: " ,quantity)
        console.log("soldAmount is: " ,soldAmount)
        console.log("unitPrice is: " ,unitPrice)
        console.log("revenue is: " ,revenue)

        milkInventory.quantity = quantity + soldAmount;
        milkInventory.price += revenue;

        await milkInventory.save();

        // 4. Get current month/year from date
        const recordDate = new Date(date);
        const month = recordDate.getMonth() + 1;
        const year = recordDate.getFullYear();

        // 5. Update/create income entry for that month
        let income = await Income.findOne({ month, year });
        if (!income) {
            income = new Income({
                month,
                year,
                resources: [],
                totalCost: 0,
            });
        }

        const existingResource = income.resources.find(r =>
            r.item.toString() === milkInventory._id.toString()
        );

        if (existingResource) {
            existingResource.price += revenue;
        } else {
            income.resources.push({
                item: milkInventory._id,
                price: revenue,
            });
        }

        income.totalCost += revenue;

        await income.save();
        await Task.deleteMany({
            type: 'milk',
            dueDate: {
                $gte: new Date(date),
                $lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000) // matches the same day
            }
        });
        res.status(201).json({ message: 'تم إنشاء تسجيل الحليب وتحديث الجرد والإيرادات', record });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'خطأ في إنشاء التسجيل وتحديث البيانات' });
    }
};

// Read all
export const getAllMilkRecords = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Fetch only records in current month
        const records = await MilkProduction.find({
            date: {
                $gte: startOfMonth,
                $lte: now
            }
        }).sort({ date: -1 });
        res.json(records);
    } catch (err) {
        res.status(500).json({ error: 'خطأ في جلب البيانات' });
    }
};


export const getMilkYearlySummary = async (req, res) => {
    try {
        const result = await MilkProduction.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                        month: { $month: "$date" }
                    },
                    totalProduction: { $sum: "$production" },
                    totalSold: { $sum: "$sold" },
                    totalRevenue: { $sum: { $multiply: ["$price", "$sold"] } },
                }
            },
            {
                $sort: { "_id.year": -1, "_id.month": -1 } // latest first
            }
        ]);

        res.status(200).json(result);
    } catch (error) {
        console.error("❌ Error fetching milk summary:", error);
        res.status(500).json({ error: "Failed to get milk summary" });
    }
};


// Update
export const updateMilkRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await MilkProduction.findByIdAndUpdate(id, req.body, { new: true });
        if (!updated) return res.status(404).json({ error: 'السجل غير موجود' });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: 'خطأ في تحديث البيانات' });
    }
};

// Delete
export const deleteMilkRecord = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Find the milk record
        const record = await MilkProduction.findById(id);
        if (!record) {
            return res.status(404).json({ error: "لم يتم العثور على سجل الحليب" });
        }

        const { date, sold, price } = record;

        // 2. Find milk inventory
        const milkInventory = await Inventory.findOne({ type: 'حليب', category: 'income' });
        if (!milkInventory) {
            return res.status(400).json({ error: 'لم يتم العثور على عنصر الحليب في الجرد' });
        }

        // 3. Revert inventory (decrease sold quantity and revenue)
        const soldAmount = Number(sold);
        const unitPrice = Number(price);
        const revenue = soldAmount * unitPrice;

        milkInventory.quantity = Math.max(0, Number(milkInventory.quantity) - soldAmount);
        milkInventory.price = Math.max(0, Number(milkInventory.price) - revenue);

        await milkInventory.save();

        // 4. Get month/year from record date
        const recordDate = new Date(date);
        const month = recordDate.getMonth() + 1;
        const year = recordDate.getFullYear();

        // 5. Update income
        let income = await Income.findOne({ month, year });
        if (income) {
            const resource = income.resources.find(r =>
                r.item.toString() === milkInventory._id.toString()
            );

            if (resource) {
                resource.price = Math.max(0, resource.price - revenue);
            }

            income.totalCost = Math.max(0, income.totalCost - revenue);

            // Clean resources with 0 price
            income.resources = income.resources.filter(r => r.price > 0);

            await income.save();
        }

        // 6. Delete the milk record
        await MilkProduction.findByIdAndDelete(id);

        res.status(200).json({ message: "تم حذف سجل الحليب وتحديث البيانات" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "خطأ في حذف سجل الحليب" });
    }
};
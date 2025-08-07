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

        milkInventory.quantity = quantity + soldAmount;
        milkInventory.price += soldAmount * unitPrice;

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
        const deleted = await MilkProduction.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ error: 'السجل غير موجود' });
        res.json({ message: 'تم الحذف بنجاح' });
    } catch (err) {
        res.status(500).json({ error: 'خطأ في حذف البيانات' });
    }
};
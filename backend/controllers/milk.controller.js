import MilkProduction from '../models/milkProduction.model.js';

// Create
export const createMilkRecord = async (req, res) => {
    try {
        const { date, production, sold, price } = req.body;
        const record = await MilkProduction.create({ date, production, sold, price });
        res.status(201).json(record);
    } catch (err) {
        res.status(500).json({ error: 'خطأ في إنشاء التسجيل' });
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
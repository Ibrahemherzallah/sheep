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
        const records = await MilkProduction.find().sort({ date: -1 });
        res.json(records);
    } catch (err) {
        res.status(500).json({ error: 'خطأ في جلب البيانات' });
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
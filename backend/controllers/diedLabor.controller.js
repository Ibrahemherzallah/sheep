import DiedLabor from "../models/diedLabor.model.js";

export const addDiedLabor = async (req, res) => {
    try {
        const { males, females, notes, date } = req.body;

        const died = await DiedLabor.create({
            males,
            females,
            notes,
            date
        });

        res.status(201).json({ success: true, died });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getDiedLaborsByCycle = async (req, res) => {
    try {
        const { cycleId } = req.params;

        const diedLabors = await DiedLabor.find({ cycleId });

        res.json({ success: true, diedLabors });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getDiedTotals = async (req, res) => {
    try {
        const { cycleId } = req.params;

        const totals = await DiedLabor.aggregate([
            { $match: { cycleId: new mongoose.Types.ObjectId(cycleId) } },
            { $group: { _id: null, totalMales: { $sum: "$males" }, totalFemales: { $sum: "$females" } } }
        ]);

        res.json({ success: true, totals: totals[0] || { totalMales: 0, totalFemales: 0 } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

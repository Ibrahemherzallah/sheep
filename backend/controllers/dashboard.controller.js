import Sheep from "../models/sheep.model.js";
import Cycle from "../models/cycle.model.js";

export const dashboard = async (req, res) => {
    try {
        const totalSheep = await Sheep.countDocuments({});
        const pregnantSheep = await Sheep.countDocuments({ isPregnant: true });
        const patientSheep = await Sheep.countDocuments({ isPatient: true });
        const activeCycles = await Cycle.countDocuments({ status: 'نشط' }); // or whatever "active" means in your case

        res.json({
            totalSheep,
            pregnantSheep,
            patientSheep,
            activeCycles,
        });
    } catch (error) {
        console.error('Error fetching dashboard summary:', error);
        res.status(500).json({ error: 'Server error while fetching dashboard summary' });
    }
}
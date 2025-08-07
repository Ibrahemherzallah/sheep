import Supplimant from '../models/pregnantSupplimants.model.js';

export const editSupplimants = async (req, res) => {
    console.log("ENTERRR");
    const { id } = req.params;
    const { isfenjeh, hermon } = req.body;

    // Convert string inputs to numbers
    const isfenjehNum = Number(isfenjeh);
    const hermonNum = Number(hermon);

    try {
        const supplimant = await Supplimant.findById(id);

        if (!supplimant) {
            return res.status(404).json({ message: "Record not found" });
        }

        // Add new values to existing ones
        supplimant.numOfIsfenjeh += isfenjehNum;
        supplimant.numOfHermon += hermonNum;

        const updated = await supplimant.save();

        res.status(200).json(updated);
    } catch (error) {
        console.error("Error updating supplimants:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

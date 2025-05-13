// Create Vitamin
import InjectionType from "../models/injectionType.model.js";
import DrugType from "../models/drugType.model.js";
import Vitamins from "../models/vitamis.model.js";

export const createVitamin = async (req, res) => {
    try {
        const {vitaminName, vitaminPrice,quantity,unit, notes} = req.body;

        const existing = await Vitamins.findOne({vitaminName});
        if (existing) {
            return res.status(400).json({error: "هذا الفيتامين موجود"});
        }

        const vitamin = new Vitamins({vitaminName, vitaminPrice,quantity,unit, notes});
        await vitamin.save();

        res.status(201).json({message: "vitamin type created", data: vitamin});
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to create vitamin' });
    }
};

// Get All Vitamins
export const getVitamins = async (req, res) => {
    try {
        const vitamins = await Vitamins.find();
        res.json(vitamins);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch vitamins' });
    }
};

// Update Vitamin
export const updateVitamin = async (req, res) => {
    try {
        const updated = await Vitamins.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ error: 'Vitamin not found' });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update vitamin' });
    }
};

// Delete Vitamin
export const deleteVitamin = async (req, res) => {
    try {
        const deleted = await Vitamins.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Vitamin not found' });
        res.json({ message: 'Vitamin deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete vitamin' });
    }
};

////////////////////////


export const createDrugType = async (req, res) => {
    try {
        const { name, patientTakeFor,quantity,unit, notes } = req.body;

        const existing = await DrugType.findOne({ name });
        if (existing) {
            return res.status(400).json({ error: "هذا الدواء موجود" });
        }

        const drugType = new DrugType({ name, patientTakeFor,quantity,unit, notes });
        await drugType.save();

        res.status(201).json({ message: "Drug type created", data: drugType });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create drug type" });
    }
};

export const getAllDrugTypes = async (req, res) => {
    try {
        const drugTypes = await DrugType.find();
        res.status(200).json(drugTypes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch drug types" });
    }
};

export const getDrugTypeById = async (req, res) => {
    try {
        const { id } = req.params;
        const drugType = await DrugType.findById(id);

        if (!drugType) {
            return res.status(404).json({ error: "Drug type not found" });
        }

        res.status(200).json(drugType);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch drug type" });
    }
};

export const updateDrugType = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, patientTakeFor, notes } = req.body;

        const updated = await DrugType.findByIdAndUpdate(
            id,
            { name, patientTakeFor, notes },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ error: "Drug type not found" });
        }

        res.status(200).json({ message: "Drug type updated", data: updated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update drug type" });
    }
};


export const deleteDrugType = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await DrugType.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ error: "Drug type not found" });
        }

        res.status(200).json({ message: "Drug type deleted", data: deleted });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete drug type" });
    }
};
////////////////////////


// Create Injection Type
export const createInjection = async (req, res) => {
    try {
        const { name, reputation,quantity,unit, notes } = req.body;

        const existing = await InjectionType.findOne({ name });
        if (existing) {
            return res.status(400).json({ error: "هذا الطعم موجود" });
        }

        const injectionType = new InjectionType({ name, reputation,quantity,unit, notes });
        await injectionType.save();

        res.status(201).json({ message: "injection type created", data: injectionType });
    }
    catch (err) {
        console.error("Create Injection Error:", err);
        res.status(500).json({ error: 'Failed to create injection type' });
    }
};

// Get All Injection Types
export const getInjections = async (req, res) => {
    try {
        const injections = await InjectionType.find();
        res.json(injections);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch injections' });
    }
};

// Update Injection Type
export const updateInjection = async (req, res) => {
    try {
        const updated = await InjectionType.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ error: 'Injection not found' });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update injection' });
    }
};

// Delete Injection Type
export const deleteInjection = async (req, res) => {
    try {
        const deleted = await InjectionType.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Injection not found' });
        res.json({ message: 'Injection deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete injection' });
    }
};
import cycle from "../models/cycle.model.js";
import ReportModel from "../models/report.model.js"; // Adjust the path if needed



export const createReport = async (req, res) => {
    try {
        const {
            cycleId,
            startDate,
            endDate,
            numOfFeed,
            numOfMilk,
            vitamins
        } = req.body;

        // Create the report
        const newReport = new ReportModel({
            cycleId,
            startDate,
            endDate,
            numOfFeed,
            numOfMilk,
            vitamins
        });


        // Add the report ID to the cycle's reports array
        const isCycle = await cycle.findByIdAndUpdate(
            cycleId,
            { $push: { reports: newReport._id } },
            { new: true }
        );
        if(!isCycle) {
            return res.status(400).json({ message: 'Cycle not found' });
        }

        await newReport.save();
        res.status(201).json({ message: 'Report created and linked to cycle', data: newReport });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create report' });
    }
};



export const endCycle = async (req, res) => {
    try {
        const {
            cycleId,
            numOfSell,
            totalKilos,
            priceOfKilo,
            numOfDied,
            numOfStock,
            endDate
        } = req.body;

        const updatedCycle = await cycle.findByIdAndUpdate(
            cycleId,
            {
                numOfSell,
                totalKilos,
                priceOfKilo,
                numOfDied,
                numOfStock,
                endDate,
                status: 'end'
            },
            { new: true }
        );

        if (!updatedCycle) {
            return res.status(404).json({ error: 'Cycle not found' });
        }

        res.status(200).json({ message: 'Cycle ended successfully', data: updatedCycle });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to end cycle' });
    }
};


export const createCycle = async (req, res) => {
    try {
        const Cycle = new cycle(req.body);
        const savedCycle = await Cycle.save();
        res.status(201).json({ message: "Cycle created successfully", data: savedCycle });
    } catch (error) {
        console.error("Create Cycle Error:", error);
        res.status(500).json({ error: "Failed to create cycle", details: error.message });
    }
};


export const getAllCycles = async (req, res) => {
    try {
        const cycles = await Cycle.find().populate('injections.injection').populate('reports');
        res.status(200).json(cycles);
    } catch (error) {
        console.error("Get Cycles Error:", error);
        res.status(500).json({ error: "Failed to fetch cycles" });
    }
};


export const getCycleById = async (req, res) => {
    try {
        const cycle = await Cycle.findById(req.params.id).populate('injections.injection').populate('reports');
        if (!cycle) return res.status(404).json({ error: "Cycle not found" });
        res.status(200).json(cycle);
    } catch (error) {
        console.error("Get Cycle By ID Error:", error);
        res.status(500).json({ error: "Failed to fetch cycle" });
    }
};


export const updateCycle = async (req, res) => {
    try {
        const updatedCycle = await Cycle.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedCycle) return res.status(404).json({ error: "Cycle not found" });
        res.status(200).json({ message: "Cycle updated", data: updatedCycle });
    } catch (error) {
        console.error("Update Cycle Error:", error);
        res.status(500).json({ error: "Failed to update cycle" });
    }
};


export const deleteCycle = async (req, res) => {
    try {
        const deleted = await Cycle.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: "Cycle not found" });
        res.status(200).json({ message: "Cycle deleted" });
    } catch (error) {
        console.error("Delete Cycle Error:", error);
        res.status(500).json({ error: "Failed to delete cycle" });
    }
};

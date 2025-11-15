import TrahCase from '../models/trahCases.model.js';
import Sheep from '../models/sheep.model.js';
import Pregnancy from "../models/pregnancy.model.js";
import Supplimant from "../models/pregnantSupplimants.model.js";
import {createBirthRelatedTasks, createTrahRelatedTasks} from "../services/taskService.js";
import {deleteTasksForSheepAfterBirth} from "./pregnancy.controller.js";

// Add new trah cases
export const addTrahCases = async (req, res) => {
    try {
        const { trahDate, births, notes } = req.body;

        const createdTrahCases = [];

        for (const birth of births) {
            const { sheepId, numberOfMaleLamb, numberOfFemaleLamb } = birth;

            // 🔹 Fetch the sheep with current trahCases and pregnantCases
            const sheep = await Sheep.findById(sheepId).populate('trahCases').populate('pregnantCases');

            // 🔹 Determine the order automatically
            const currentOrder = sheep.trahCases ? sheep.trahCases.length + 1 : 1;

            // 1️⃣ Create a new TrahCase
            const newTrahCase = await TrahCase.create({
                sheepId,
                trahDate,
                numberOfMaleLamb,
                numberOfFemaleLamb,
                order: currentOrder,
                notes
            });

            createdTrahCases.push(newTrahCase);

            // 2️⃣ Remove the last pregnancy from pregnantCases
            if (sheep.pregnantCases && sheep.pregnantCases.length > 0) {
                sheep.pregnantCases.pop();
            }

            // 3️⃣ Update sheep: add trahCase, set isPregnant to false, and update pregnantCases
            await Sheep.findByIdAndUpdate(sheepId, {
                $push: { trahCases: newTrahCase._id },
                $set: { isPregnant: false, pregnantCases: sheep.pregnantCases }
            });

            // 4️⃣ Delete tasks after birth
            await deleteTasksForSheepAfterBirth(sheepId);
        }

        // 5️⃣ Create trah-related tasks
        if (createdTrahCases.length > 0) {
            const allSheepIds = births.map(b => b.sheepId);
            await createTrahRelatedTasks({ trahDate }, allSheepIds);
        }

        res.status(200).json({
            message: "Trah cases added successfully, sheep updated, pregnancies removed, and tasks managed.",
            data: createdTrahCases
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "فشل تسجيل حالة الطرح" });
    }
};


export const deleteTrahCase = async (req, res) => {
    try {
        const { trahId } = req.params;

        // 1️⃣ Find the trah case
        const trahCase = await TrahCase.findById(trahId);
        if (!trahCase) {
            return res.status(404).json({ message: "Trah case not found" });
        }

        const sheepId = trahCase.sheepId;

        // 2️⃣ Remove reference from sheep
        await Sheep.findByIdAndUpdate(
            sheepId,
            { $pull: { trahCases: trahId } }
        );

        // 4️⃣ Delete the trah case itself
        await TrahCase.findByIdAndDelete(trahId);

        res.json({ message: "Trah case deleted successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error while deleting trah case" });
    }
};

export const getTrahTotals = async (req, res) => {
    try {
        const result = await TrahCase.aggregate([
            {
                $group: {
                    _id: null,
                    totalRecords: { $sum: 1 },  // عدد سجلات الطراح
                    totalMale: { $sum: "$numberOfMaleLamb" },
                    totalFemale: { $sum: "$numberOfFemaleLamb" }
                }
            }
        ]);

        const totals = result[0] || {
            totalRecords: 0,
            totalMale: 0,
            totalFemale: 0
        };

        res.json(totals);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
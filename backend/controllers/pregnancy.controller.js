import { createBirthRelatedTasks } from '../services/taskService.js';
import Pregnancy from '../models/pregnancy.model.js';
import Sheep from '../models/sheep.model.js';
import Task from "../models/task.model.js";

// Utility function to add days
const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

export const createPregnancies = async (req, res) => {
    try {
        const { sheepIds, pregnantDate, expectedBornDate } = req.body;
        const createdPregnancies = [];
        const createdTasks = [];

        for (const sheepId of sheepIds) {
            const sheep = await Sheep.findById(sheepId);

            if (!sheep) {
                return res.status(404).json({ error: `Sheep with ID ${sheepId} not found` });
            }
            if (sheep.isPregnant) {
                console.warn(`Sheep ${sheepId} is already pregnant, skipping.`);
                return res.status(404).json({ error: `النعجة صاحبة الرقم  ${sheep.sheepNumber} هي حامل ` });
            }
            if (sheep.sheepGender === "ذكر") {
                console.warn(`Sheep ${sheepId} is male, skipping.`);
                return res.status(404).json({ error: `الخروف صاحب الرقم${sheep.sheepNumber} لا يمكن ان يحمل لانه ذكر ` });
            }
            const order = sheep.pregnantCases.length + 1;

            const pregnancy = await Pregnancy.create({
                sheepId,
                pregnantDate,
                expectedBornDate,
                order
            });

            // Update sheep with new pregnancy
            sheep.isPregnant = true;
            sheep.pregnantCases.push(pregnancy._id);
            await sheep.save();



            createdPregnancies.push(pregnancy);

        }
        const task = await Task.create({
            title: 'تاريخ الولادة المتوقع',
            dueDate: new Date(expectedBornDate),
            type: 'born',
            sheepIds

        });
        createdTasks.push(task);
        res.status(201).json({
            message: "Pregnancies and expected birth tasks created.",
            data: { pregnancies: createdPregnancies, tasks: createdTasks }
        });
        } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create pregnancies" });
    }
};


export const getAllPregnancies = async (req, res) => {
    try {
        const pregnancies = await Pregnancy.find().populate('sheepId');
        res.json(pregnancies);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get pregnancies" });
    }
};

export const getPregnancyById = async (req, res) => {
    try {
        const pregnancy = await Pregnancy.findById(req.params.id).populate('sheepId');
        if (!pregnancy) return res.status(404).json({ error: 'Not found' });
        res.json(pregnancy);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get pregnancy" });
    }

};



export const updateOnePregnancy = async (req, res) => {
    try {
        const updated = await Pregnancy.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update pregnancy" });
    }
};


export const updateLastPregnanciesAfterBirth = async (req, res) => {
    try {
        const { bornDate, births } = req.body;
        const updatedPregnancies = [];
        const allBornedSheepIds = [];

        for (const birth of births) {
            const { sheepId, numberOfMaleLamb, numberOfFemaleLamb } = birth;

            const sheep = await Sheep.findById(sheepId).populate('pregnantCases');

            if (!sheep || sheep.pregnantCases.length === 0) {
                console.warn(`No pregnancies found for sheep ${sheepId}`);
                continue;
            }

            // Get most recent pregnancy
            const lastPregnancyId = sheep.pregnantCases[sheep.pregnantCases.length - 1];

            const updatedPregnancy = await Pregnancy.findByIdAndUpdate(
                lastPregnancyId,
                {
                    bornDate,
                    numberOfMaleLamb,
                    numberOfFemaleLamb
                },
                { new: true }
            );

            // Set isPregnant to false after birth
            await Sheep.findByIdAndUpdate(sheepId, { isPregnant: false });

            allBornedSheepIds.push(sheepId);
            updatedPregnancies.push(updatedPregnancy);
        }

        // Create tasks for all borned sheep
        if (allBornedSheepIds.length > 0) {
            await createBirthRelatedTasks({ bornDate }, allBornedSheepIds);
        }

        res.status(200).json({
            message: "Pregnancies updated, sheep status set, and tasks created.",
            data: updatedPregnancies
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update pregnancies after birth." });
    }
};


export const deletePregnancy = async (req, res) => {
    try {
        const deleted = await Pregnancy.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted', deleted });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete pregnancy" });
    }

};

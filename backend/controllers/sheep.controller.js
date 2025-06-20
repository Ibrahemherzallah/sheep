import Sheep from '../models/sheep.model.js';
import Pregnancy from '../models/pregnancy.model.js';

import Patient from '../models/patient.model.js';
import Task from "../models/task.model.js";
import InjectionModel from "../models/injection.model.js";
import StockModel from "../models/stock.model.js";


export const createSheep = async (req, res) => {
    try {
        const {
            sheepNumber,
            sheepGender,
            isPregnant,
            isPatient,
            source,
            status,
            sellPrice,
            patientName,
            patientDate,
            drug,
            order,
            pregnantDate,
            expectedBornDate,
            pregnantDuration,
            birthDate, // 📌 NEW FIELD
            notes,
        } = req.body;

        // Check if sheepNumber is unique
        const existingSheep = await Sheep.findOne({ sheepNumber });
        if (existingSheep) {
            return res.status(400).json({ error: "رقم النعجة بالفعل موجود." });
        }

        // Validate birthDate
        if (!birthDate) {
            return res.status(400).json({ error: "تاريخ الميلاد مطلوب." });
        }

        let medicalStatus = "حي"; // Default status
        if (isPatient) {
            medicalStatus = "مريض";
        } else if (isPregnant) {
            medicalStatus = "حامل";
        }

        // Create the sheep document
        const newSheep = new Sheep({
            sheepNumber,
            sheepGender,
            source,
            status,
            sellPrice,
            birthDate,
            isPregnant,
            isPatient,
            medicalStatus,
            notes,
        });

        // Handle Pregnancy
        if (isPregnant) {
            if (!pregnantDate || !expectedBornDate || !order) {
                return res.status(400).json({
                    error: "Missing pregnancy data: 'pregnantDate', 'expectedBornDate', or 'order'.",
                });
            }

            if (sheepGender === "ذكر") {
                return res.status(400).json({
                    error: "الذكر لا يمكن ان يحمل.",
                });
            }

            const pregnancy = await Pregnancy.create({
                sheepId: newSheep._id,
                pregnantDate,
                expectedBornDate,
                order,
            });

            // Add task for expected birth date
            await Task.create({
                title: "تاريخ الولادة المتوقع",
                dueDate: new Date(expectedBornDate),
                type: "born",
                sheepIds: newSheep._id,
            });

            // Add task for injection (after 90 days)
            const pasteurellaDate = new Date(pregnantDate);
            pasteurellaDate.setDate(pasteurellaDate.getDate() + 90);

            await Task.create({
                title: "إعطاء لقاح الباستيريلا وال فيرست ايد",
                dueDate: pasteurellaDate,
                type: "injection",
                sheepIds: newSheep._id,
            });

            newSheep.pregnantCases.push(pregnancy._id);
        }

        // Handle Patient
        let patientRecord = null;
        if (isPatient) {
            if (!patientName || !patientDate || !drug) {
                return res.status(400).json({
                    error: "Missing patient data: 'patientName', 'patientDate' or 'drug'.",
                });
            }

            patientRecord = await Patient.create({
                sheepId: newSheep._id,
                patientName,
                patientDate,
                notes,
                drugs: [{ drug, order: 1 }],
            });

            newSheep.patientCases.push(patientRecord._id);
        }

        // Save the sheep
        await newSheep.save();

        res.status(201).json({
            message: "تمت إضافة النعجة بنجاح.",
            sheep: newSheep,
            patient: patientRecord,
        });
    } catch (err) {
        console.error("❌ createSheep error:", err);
        res.status(500).json({ error: "فشل في إضافة النعجة والمعلومات المرتبطة." });
    }
};


export const updateSheepStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, sellPrice } = req.body;

        // Step 1: Update the sheep
        const updatedSheep = await Sheep.findByIdAndUpdate(
            id,
            {
                status,
                isPregnant: false,
                isPatient: false,
                ...(sellPrice !== undefined ? { sellPrice } : {}),
            },
            { new: true }
        );

        if (!updatedSheep) {
            return res.status(404).json({ message: "Sheep not found" });
        }

        // Step 2: Remove the sheep ID from any tasks
        await Task.updateMany(
            { sheepIds: id },
            { $pull: { sheepIds: id } }
        );

        res.status(200).json({
            message: 'Sheep status updated and removed from tasks.',
            sheep: updatedSheep
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating status or tasks" });
    }
};

export const getAllSheep = async (req, res) => {
    try {
        const sheep = await Sheep.find()
            .populate('pregnantCases')
            .populate({
                path: 'patientCases',
                populate: {
                    path: 'drugs.drug', // 👈 populate the nested drug field
                    model: 'StockModel',
                },
            });

        res.json(sheep);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to retrieve sheep' });
    }
};

export const getLatestPatientCasesForSickSheep = async (req, res) => {
    try {
        // Step 1: Get all sick sheep
        const sickSheep = await Sheep.find({ isPatient: true })
            .populate({
                path: 'patientCases',
                options: { sort: { patientDate: -1 } }, // latest first
                populate: { path: 'drugs.drug' }
            });
console.log("sickSheep is : ",  sickSheep)
        // Step 2: Get only the last patient case for each sheep
        const result = sickSheep.map(sheep => {
            const latestPatient = sheep.patientCases?.[0] || null;
            return {
                sheepId: sheep._id,
                sheepNumber: sheep.sheepNumber,
                latestPatient,
            };
        });
        result.sort((a, b) => new Date(b.latestPatient?.patientDate) - new Date(a.latestPatient?.patientDate));

        res.json(result);
    } catch (err) {
        console.error('Error fetching latest patient cases:', err);
        res.status(500).json({ error: 'Failed to fetch latest patient cases.' });
    }
};

export const getListSheepById = async (req, res) => {
    try {
        const { ids } = req.body;
        const sheep = await Sheep.find({ _id: { $in: ids } });
        res.json(sheep);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch sheep' });
    }
}

export const getSheepInjectionHistory = async (req, res) => {
    try {
        const { id } = req.params;

        const [injectionTypes, injections] = await Promise.all([
            StockModel.find({ type: 'Injection', section: 'sheep' }),
            InjectionModel.find({ sheepId: id }).populate('injectionType')
        ]);

        res.json({ injectionTypes, injections });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'فشل في جلب بيانات الطعومات' });
    }
};

export const getSheepById = async (req, res) => {
    try {
        const sheep = await Sheep.findById(req.params.id).populate('pregnantCases');
        if (!sheep) {
            return res.status(404).json({ error: 'Sheep not found' });
        }
        res.json(sheep);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to retrieve sheep' });
    }
};



export const updateSheep = async (req, res) => {
    try {
        const { id } = req.params;
        const { sheepNumber, notes, birthDate } = req.body;

        const updatedSheep = await Sheep.findByIdAndUpdate(
            id,
            { sheepNumber, notes, birthDate },
            { new: true }
        );

        if (!updatedSheep) {
            return res.status(404).json({ message: 'Sheep not found' });
        }

        res.status(200).json(updatedSheep);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};




export const deleteSheep = async (req, res) => {
    console.log("Enteredd ")
    try {
        const { id } = req.params;
console.log("The id is : ", id)
        const deletedSheep = await Sheep.findByIdAndDelete(id);
        if (!deletedSheep) {
            return res.status(404).json({ message: "Sheep not found" });
        }

        res.status(200).json({ message: "Sheep deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting sheep" });
    }
};

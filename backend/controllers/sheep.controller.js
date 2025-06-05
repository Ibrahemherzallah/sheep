import Sheep from '../models/sheep.model.js';
import Pregnancy from '../models/pregnancy.model.js';

import Patient from '../models/patient.model.js';
import Task from "../models/task.model.js";
import InjectionType from "../models/injectionType.model.js";
import InjectionModel from "../models/injection.model.js";

export const createSheep = async (req, res) => {
    try {
        const {
            isPregnant,
            pregnantDate,
            expectedBornDate,
            order,
            isPatient,
            patientName,
            patientDate,
            notes,
            drug,
            ...sheepData
        } = req.body;

        // Check if sheepNumber is unique
        const existingSheep = await Sheep.findOne({ sheepNumber: sheepData.sheepNumber });
        if (existingSheep) {
            return res.status(400).json({ error: 'رقم النعجة بالفعل موجود.' });
        }
        let medicalStatus = "حي"; // Default
        if (isPatient) {
            medicalStatus = "مريض";
        } else if (isPregnant) {
            medicalStatus = "حامل";
        }
        // Create the sheep
        const newSheep = new Sheep({ ...sheepData, isPregnant, isPatient, medicalStatus });

        // Create pregnancy if applicable
        if (isPregnant) {
            console.log("isPregnant", isPregnant);
            console.log("pregnantDate", pregnantDate,'expectedBornDate', expectedBornDate,'order', order);

            if (!pregnantDate || !expectedBornDate || !order) {
                return res.status(400).json({
                    error: "Missing pregnancy data: 'pregnantDate', 'expectedBornDate', or 'order'."
                });
            }
            const sheepId = newSheep._id;

            const pregnancy = await Pregnancy.create({
                sheepId: newSheep._id,
                pregnantDate,
                expectedBornDate,
                order,
            });
            const task = await Task.create({
                title: 'تاريخ الولادة المتوقع',
                dueDate: new Date(expectedBornDate),
                type: 'born',
                sheepIds: sheepId
            });


            const pasteurellaDate = new Date(pregnantDate);
            pasteurellaDate.setDate(pasteurellaDate.getDate() + 90);

            await Task.create({
                title: 'إعطاء لقاح الباستيريلا وال فيرست ايد',
                dueDate: pasteurellaDate,
                type: 'injection',
                sheepIds: sheepId
            });


            newSheep.pregnantCases.push(pregnancy._id);
            await newSheep.save();
        }

        // Save the sheep after modifications


        // Create patient if applicable
        let patientRecord = null;
        if (isPatient) {
            console.log("patientName" , patientName)
            console.log("patientDate" , patientDate)
            console.log("drugs" , drug)

            if (!patientName || !patientDate || !drug ) {
                return res.status(400).json({
                    error: "Missing patient data: 'patientName', 'patientDate' or 'drugs'."
                });
            }

            patientRecord = await Patient.create({
                sheepId: newSheep._id,
                patientName,
                patientDate,
                notes,
                drugs: [{ drug, order: 1 }]
            });

            newSheep.patientCases.push(patientRecord._id);

        }
        await newSheep.save();

        res.status(201).json({
            message: 'تمت إضافة النعجة بنجاح.',
            sheep: newSheep,
            patient: patientRecord
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create sheep and patient' });
    }
};

// PUT /api/sheep/:id/status
export const updateSheepStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, sellPrice } = req.body;

        const updatedSheep = await Sheep.findByIdAndUpdate(
            id,
            {
                status,
                ...(sellPrice !== undefined ? { sellPrice } : {}),
            },
            { new: true }
        );

        if (!updatedSheep) {
            return res.status(404).json({ message: "Sheep not found" });
        }

        res.status(200).json(updatedSheep);
    } catch (error) {
        res.status(500).json({ message: "Error updating status" });
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
                    model: 'DrugType',
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


export const getSheepInjectionHistory = async (req, res) => {
    try {
        const { id } = req.params;

        const [injectionTypes, injections] = await Promise.all([
            InjectionType.find({}),
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
        const { sheepNumber, notes } = req.body;

        const updatedSheep = await Sheep.findByIdAndUpdate(
            id,
            { sheepNumber, notes },
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

// DELETE /api/sheep/:id
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

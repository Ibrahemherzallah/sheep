import Sheep from '../models/sheep.model.js';
import Pregnancy from '../models/pregnancy.model.js';

import Patient from '../models/patient.model.js';
import Task from "../models/task.model.js";

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
            drugs,
            ...sheepData
        } = req.body;

        // Check if sheepNumber is unique
        const existingSheep = await Sheep.findOne({ sheepNumber: sheepData.sheepNumber });
        if (existingSheep) {
            return res.status(400).json({ error: 'Sheep number already exists.' });
        }
        let status = "حي"; // Default
        if (isPatient) {
            status = "مريض";
        } else if (isPregnant) {
            status = "حامل";
        }
        // Create the sheep
        const newSheep = new Sheep({ ...sheepData, isPregnant, isPatient, status });

        // Create pregnancy if applicable
        if (isPregnant) {
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
            newSheep.pregnantCases.push(pregnancy._id);
        }

        // Save the sheep after modifications
        await newSheep.save();

        // Create patient if applicable
        let patientRecord = null;
        if (isPatient) {
            if (!patientName || !patientDate || !drugs || drugs.length === 0) {
                return res.status(400).json({
                    error: "Missing patient data: 'patientName', 'patientDate' or 'drugs'."
                });
            }

            patientRecord = await Patient.create({
                sheepId: newSheep._id,
                patientName,
                patientDate,
                notes,
                drugs
            });

            newSheep.patientCases.push(patientRecord._id);

        }
        await newSheep.save();

        res.status(201).json({
            message: 'Sheep created successfully',
            sheep: newSheep,
            patient: patientRecord
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create sheep and patient' });
    }
};


export const getAllSheep = async (req, res) => {
    try {
        const sheep = await Sheep.find()
            .populate('pregnantCases')
            .populate('patientCases');
        res.json(sheep);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to retrieve sheep' });
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

        const status = req.body.status;

        if (status) {
            req.body.isPatient = false;
            req.body.isPregnant = false;
        }

        const updated = await Sheep.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });

        if (!updated) {
            return res.status(404).json({ error: 'Sheep not found' });
        }
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update sheep' });
    }
};

export const deleteSheep = async (req, res) => {
    try {
        const deleted = await Sheep.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Sheep not found' });
        }
        res.json({ message: 'Sheep deleted successfully', deleted });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete sheep' });
    }
};
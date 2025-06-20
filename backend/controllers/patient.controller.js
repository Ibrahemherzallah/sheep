import Patient from "../models/patient.model.js";
import Sheep from "../models/sheep.model.js";
import Pregnancy from "../models/pregnancy.model.js";

export const createPatient = async (req, res) => {
    try {
        const { sheepIds, patientName, drugs, patientDate, notes } = req.body;
        const createdPatiencies = [];

        for (const sheepId of sheepIds) {
            const sheep = await Sheep.findById(sheepId);

            if (!sheep) {
                return res.status(404).json({ error: `Sheep with ID ${sheepId} not found` });
            }
            if (sheep.isPatient) {
                console.warn(`Sheep ${sheepId} is already patient, skipping.`);
                return res.status(404).json({ error: `النعجة صاحبة الرقم  ${sheep.sheepNumber} هي مريضة ` });
            }

            // 🗓️ Calculate healingDate = patientDate + 5 days
            const baseDate = new Date(patientDate || Date.now());
            const healingDate = new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000); // +5 days

            const patient = await Patient.create({
                sheepId: sheep._id,
                patientName,
                patientDate,
                healingDate,
                notes,
                drugs
            });

            // Update sheep with new pregnancy
            sheep.isPatient = true;
            sheep.medicalStatus = "مريضة";
            sheep.patientCases.push(patient._id);
            await sheep.save();



            createdPatiencies.push(patient);

        }

        res.status(201).json({
            data: { Patiencies: createdPatiencies }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create patient record" });
    }
};


export const getAllPatients = async (req, res) => {
    try {
        const patients = await Patient.find()
            .populate('sheepId', 'sheepNumber') // populate sheep info
            .populate('drugs.drug', 'name'); // populate drug names

        res.status(200).json(patients);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch patients" });
    }
};

export const getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id)
            .populate('sheepId', 'sheepNumber')
            .populate('drugs.drug', 'name');

        if (!patient) return res.status(404).json({ error: "Patient not found" });

        res.status(200).json(patient);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch patient" });
    }
};

export const addDrugToLatestPatient = async (req, res) => {
    try {
        const { sheepId } = req.params;
        const { drug, order } = req.body;

        if (!drug || order == null) {
            return res.status(400).json({ error: "Both 'drug' and 'order' are required." });
        }

        // Find the latest patient case for the given sheep
        const latestPatient = await Patient.findOne({ sheepId })
            .sort({ createdAt: -1 });

        if (!latestPatient) {
            return res.status(404).json({ error: "No patient case found for this sheep." });
        }

        // Add the new drug to the drugs array
        latestPatient.drugs.push({ drug, order });

        // 🗓️ Recalculate healing date = now + 5 days
        const newHealingDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
        latestPatient.healingDate = newHealingDate;

        // Save the updated patient case
        const updatedPatient = await latestPatient.save();

        res.status(200).json({
            message: "Drug added to latest patient case",
            data: updatedPatient
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "فشل التعديل المرض مع الدواء الجديد" });
    }
};

export const updatePatient = async (req, res) => {
    try {
        const updatedPatient = await Patient.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).populate('sheepId', 'sheepNumber')
            .populate('drugs.drug', 'name');

        if (!updatedPatient) return res.status(404).json({ error: "Patient not found" });

        res.status(200).json({ message: "Patient updated", data: updatedPatient });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "فشل تعديل المرض" });
    }
};

export const deletePatient = async (req, res) => {
    try {
        const deleted = await Patient.findByIdAndDelete(req.params.id);

        if (!deleted) return res.status(404).json({ error: "Patient not found" });

        res.status(200).json({ message: "Patient deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete patient" });
    }
};